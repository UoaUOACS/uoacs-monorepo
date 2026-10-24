import { AuthCollectionSlugs, type SignUpBody } from "@uoacs/shared"
import {
  type CreateMemberInput,
  createMemberSchema,
  type Member,
  type UpdateMemberInput,
} from "@uoacs/shared/payload"
import type { User } from "better-auth"
import { isAPIError } from "better-auth/api"
import { NotFound, ValidationError } from "payload"
import { auth } from "@/lib/auth/auth"
import { getPayloadClient } from "@/lib/payload"

export class NoUnlinkedMemberError extends Error {
  constructor(public readonly email: string) {
    super("No membership awaiting an account for that email")
    this.name = "NoUnlinkedMemberError"
  }
}

export class DuplicateFieldError extends Error {
  constructor(public readonly field: string) {
    super("Value already in use")
    this.name = "DuplicateFieldError"
  }
}

/** The account was created but could not be deleted after a later failure. */
export class AccountRollbackError extends Error {
  constructor(
    public readonly betterAuthUserId: string,
    cause: unknown,
  ) {
    super("Account rollback failed", { cause })
    this.name = "AccountRollbackError"
  }
}

function duplicateField(err: unknown): string | null {
  if (!(err instanceof ValidationError)) return null
  const duplicate = err.data?.errors?.find((e) => e.message === "Value must be unique")
  return duplicate ? (duplicate.path ?? "") : null
}

export class MemberService {
  public async findByUserId(userId: string): Promise<Member | null> {
    const payload = await getPayloadClient()
    const res = await payload.find({
      collection: AuthCollectionSlugs.MEMBER,
      where: { betterAuthUserId: { equals: userId } },
      limit: 1,
    })
    return res.docs[0] ?? null
  }

  public async findById(id: string): Promise<Member | null> {
    const payload = await getPayloadClient()
    try {
      return await payload.findByID({ collection: AuthCollectionSlugs.MEMBER, id })
    } catch (err) {
      // Only a genuine miss is null. Swallowing everything would report a
      // database outage to an operator as "this member is already gone".
      if (err instanceof NotFound) return null
      throw err
    }
  }

  /**
   * A member row with no linked account: signed up before Better Auth existed.
   *
   * Counted rather than fetched — the answer is a boolean, so there is no
   * reason to pull a member's details back for it.
   */
  public async hasUnlinkedMember(email: string): Promise<boolean> {
    const payload = await getPayloadClient()
    const { totalDocs } = await payload.count({
      collection: AuthCollectionSlugs.MEMBER,
      where: { email: { equals: email }, betterAuthUserId: { equals: null } },
    })
    return totalDocs > 0
  }

  public async create(data: CreateMemberInput, betterAuthUserId: string): Promise<Member> {
    const payload = await getPayloadClient()
    try {
      return await payload.create({
        collection: AuthCollectionSlugs.MEMBER,
        data: { ...data, betterAuthUserId },
      })
    } catch (err) {
      const field = duplicateField(err)
      if (field !== null) throw new DuplicateFieldError(field)
      throw err
    }
  }

  /** Claims a pre-Better-Auth member row for a newly created account. */
  public async link(email: string, betterAuthUserId: string): Promise<Member> {
    const payload = await getPayloadClient()
    const existing = await payload.find({
      collection: AuthCollectionSlugs.MEMBER,
      where: { email: { equals: email }, betterAuthUserId: { equals: null } },
      limit: 1,
    })

    const doc = existing.docs[0]
    if (!doc) throw new NoUnlinkedMemberError(email)

    // `db.updateOne` skips the collection's hooks, so the names are synced here.
    await this.syncAccountName(betterAuthUserId, doc)
    const updated = await payload.db.updateOne({
      collection: AuthCollectionSlugs.MEMBER,
      id: doc.id,
      data: { betterAuthUserId },
    })
    if (!updated) throw new NoUnlinkedMemberError(email)

    return { ...doc, betterAuthUserId }
  }

  public async update(id: string, data: UpdateMemberInput): Promise<Member> {
    const payload = await getPayloadClient()
    try {
      return await payload.update({ collection: AuthCollectionSlugs.MEMBER, id, data })
    } catch (err) {
      const field = duplicateField(err)
      if (field !== null) throw new DuplicateFieldError(field)
      throw err
    }
  }

  /** Copies a member's names onto their Better Auth user, which has no session to go through. */
  public async syncAccountName(
    userId: string,
    { firstName, lastName }: Pick<Member, "firstName" | "lastName">,
  ): Promise<void> {
    const context = await auth.$context
    await context.internalAdapter.updateUser(userId, {
      name: `${firstName} ${lastName}`,
      firstName,
      lastName,
    })
  }

  /**
   * Removes the member row and the account behind it. Order matters: a failure
   * after the row is gone would leave an account that can log in but resolves
   * to no member.
   */
  public async deleteWithAccount(id: string, betterAuthUserId?: string | null): Promise<void> {
    if (betterAuthUserId) await this.deleteAccount(betterAuthUserId)

    const payload = await getPayloadClient()
    try {
      await payload.delete({ collection: AuthCollectionSlugs.MEMBER, id })
    } catch (err) {
      console.error(
        "[MemberService] CRITICAL: account deleted but member row remains. The member cannot log in, reset a password or sign up again — delete the row by hand.",
        { id, betterAuthUserId, error: err },
      )
      throw err
    }
  }

  public async deleteAccount(userId: string): Promise<void> {
    const context = await auth.$context
    await context.internalAdapter.deleteAccounts(userId)
    await context.internalAdapter.deleteUser(userId)
  }

  /**
   * Creates the account and its member row together. A person who predates
   * Better Auth gets their existing row linked; everyone else gets a new one.
   * A full member body for an email with an unlinked member links that row and
   * ignores the member fields.
   *
   * Throws `ZodError` for an invalid member body (before any account exists),
   * `DuplicateFieldError` when the email or a unique member field is taken,
   * `NoUnlinkedMemberError` when an existing-member claim finds no row to link,
   * and `AccountRollbackError` when the account could not be undone.
   */
  public async register(body: SignUpBody): Promise<Member> {
    let memberData: CreateMemberInput | null = null
    if (!("existingMember" in body)) {
      const parsed = createMemberSchema.safeParse(body)
      if (!parsed.success) throw parsed.error
      memberData = parsed.data
    }

    let user: User
    try {
      user = await this.signUp(body)
    } catch (err) {
      if (isAPIError(err) && err.body?.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL") {
        throw new DuplicateFieldError("email")
      }
      throw err
    }

    try {
      if (!memberData || (await this.hasUnlinkedMember(body.email))) {
        return await this.link(body.email, user.id)
      }
      return await this.create(memberData, user.id)
    } catch (err) {
      // The account exists but has no member row, so it would be a login that
      // resolves to nothing. Undo it rather than leave that behind.
      try {
        await this.deleteAccount(user.id)
      } catch (cleanupError) {
        console.error("[MemberService] CRITICAL: account rollback failed, record leaked", {
          betterAuthUserId: user.id,
          error: cleanupError,
          originalError: err,
        })
        throw new AccountRollbackError(user.id, cleanupError)
      }
      throw err
    }
  }

  public async signUp(data: {
    firstName: string
    lastName: string
    email: string
    password: string
  }): Promise<User> {
    const { user } = await auth.api.signUpEmail({
      body: {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        password: data.password,
      },
    })
    return user
  }
}
