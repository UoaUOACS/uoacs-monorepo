import { type Document, MongoClient } from "mongodb"

const sourceUri = process.env.WEBSITE_DATABASE_URI
const targetUri = process.env.DATABASE_URI
if (!sourceUri) throw new Error("WEBSITE_DATABASE_URI is not set (the website database to read)")
if (!targetUri) throw new Error("DATABASE_URI is not set (the auth database to write)")

const commit = process.argv.includes("--commit")

// Payload's mongo adapter pluralises a slug into a collection name unless the
// collection sets `dbName`, so the `member` slug lives in `members`. Better
// Auth's adapter does not, so its collections keep their singular names.
const SOURCE = { member: "members", user: "user", account: "account" }
const TARGET = { member: "members", user: "user", account: "account" }

// `compsciStudent` is required too, but it is the one field we fill in rather
// than refuse, so it is checked separately.
const REQUIRED_MEMBER_FIELDS = [
  "firstName",
  "lastName",
  "email",
  "upi",
  "uoaID",
  "gender",
  "studyYear",
  "heardAboutUs",
]

const emailOf = (doc: Document) => String(doc.email ?? "").toLowerCase()
const idOf = (value: unknown) => String(value)

const source = new MongoClient(sourceUri)
const target = new MongoClient(targetUri)

try {
  await Promise.all([source.connect(), target.connect()])
  const from = source.db()
  const to = target.db()

  console.log(`${from.databaseName} -> ${to.databaseName}`)
  console.log(commit ? "mode: COMMIT\n" : "mode: dry run (pass --commit to write)\n")

  const ids = { projection: { _id: 1, email: 1 } }
  const [members, users, accounts, existingMembers, existingUsers, existingAccounts, sessions] =
    await Promise.all([
      from.collection(SOURCE.member).find().toArray(),
      from.collection(SOURCE.user).find().toArray(),
      from.collection(SOURCE.account).find().toArray(),
      to.collection(TARGET.member).find({}, ids).toArray(),
      to.collection(TARGET.user).find({}, ids).toArray(),
      to.collection(TARGET.account).find({}, ids).toArray(),
      from.collection("session").countDocuments(),
    ])

  const userIds = new Set(users.map((user) => idOf(user._id)))
  const membersByUserId = new Map<string, Document[]>()
  for (const member of members) {
    if (!member.betterAuthUserId) continue
    const key = idOf(member.betterAuthUserId)
    membersByUserId.set(key, [...(membersByUserId.get(key) ?? []), member])
  }

  // Anything the staging data did not teach us about stops the run rather than
  // being guessed at. Every blocker is collected so one pass shows them all.
  const blockers: string[] = []

  for (const member of members) {
    const missing = REQUIRED_MEMBER_FIELDS.filter((field) => {
      const value = member[field]
      return value === null || value === undefined || value === ""
    })
    if (missing.length > 0) {
      blockers.push(`member ${member.email ?? member._id} is missing ${missing.join(", ")}`)
    }
  }

  for (const [userId, rows] of membersByUserId) {
    if (!userIds.has(userId)) {
      blockers.push(`member ${rows[0].email} points at user ${userId}, which does not exist`)
    }
    if (rows.length > 1) {
      blockers.push(
        `user ${userId} has ${rows.length} member rows (${rows.map(emailOf).join(", ")})`,
      )
    }
  }

  const emailCounts = new Map<string, number>()
  for (const member of members) {
    emailCounts.set(emailOf(member), (emailCounts.get(emailOf(member)) ?? 0) + 1)
  }
  for (const [email, count] of emailCounts) {
    if (count > 1) blockers.push(`source has ${count} members with the email ${email}`)
  }

  // A clash on a unique index would abort the insert partway, so it is caught here.
  const collisions = (existing: Document[], incoming: Document[], label: string) => {
    const byEmail = new Map(existing.map((doc) => [emailOf(doc), idOf(doc._id)]))
    for (const doc of incoming) {
      const clash = byEmail.get(emailOf(doc))
      if (clash && clash !== idOf(doc._id)) {
        blockers.push(`target already has a different ${label} with the email ${emailOf(doc)}`)
      }
    }
  }
  collisions(existingMembers, members, "member")

  // An account with no membership behind it can sign in and resolve to nothing,
  // which is the state `register()` rolls back. Leave it; the person can sign up.
  const usersToCopy = users.filter((user) => membersByUserId.has(idOf(user._id)))
  const skippedUsers = users.filter((user) => !membersByUserId.has(idOf(user._id)))
  const copiedUserIds = new Set(usersToCopy.map((user) => idOf(user._id)))
  const accountsToCopy = accounts.filter((account) => copiedUserIds.has(idOf(account.userId)))

  // Only the users actually being inserted can clash; a skipped one never lands.
  collisions(existingUsers, usersToCopy, "user")

  const normalised = { compsciStudent: 0, uoaID: 0 }
  const normalisedMembers: Document[] = members.map((member) => {
    if (member.compsciStudent === null || member.compsciStudent === undefined) {
      normalised.compsciStudent++
    }
    if (typeof member.uoaID === "number") normalised.uoaID++
    return {
      ...member,
      compsciStudent: member.compsciStudent ?? false,
      uoaID: typeof member.uoaID === "number" ? String(member.uoaID) : member.uoaID,
    }
  })

  // `_id`s are carried over verbatim: `member.betterAuthUserId` is the hex string
  // of `user._id`, so new ids would break every link. Re-running then skips what
  // is already there instead of inserting it twice.
  const existingMemberIds = new Set(existingMembers.map((doc) => idOf(doc._id)))
  const existingUserIds = new Set(existingUsers.map((doc) => idOf(doc._id)))
  const existingAccountIds = new Set(existingAccounts.map((doc) => idOf(doc._id)))

  const membersToInsert = normalisedMembers.filter((doc) => !existingMemberIds.has(idOf(doc._id)))
  // Raw inserts skip the Member collection's hook, so the names it would have
  // synced onto the user are copied from the member row here.
  const usersToInsert = usersToCopy
    .filter((doc) => !existingUserIds.has(idOf(doc._id)))
    .map((user) => {
      const [member] = membersByUserId.get(idOf(user._id)) ?? []
      return { ...user, firstName: member.firstName, lastName: member.lastName }
    })
  const accountsToInsert = accountsToCopy.filter((doc) => !existingAccountIds.has(idOf(doc._id)))

  console.log("Plan:")
  console.log(
    `  members   ${membersToInsert.length} to insert, ${members.length - membersToInsert.length} already present`,
  )
  console.log(
    `  users     ${usersToInsert.length} to insert, ${usersToCopy.length - usersToInsert.length} already present`,
  )
  console.log(
    `  accounts  ${accountsToInsert.length} to insert, ${accountsToCopy.length - accountsToInsert.length} already present`,
  )
  console.log(`  sessions  not migrated (${sessions} in source, everyone signs in again)`)

  console.log("\nNormalised:")
  console.log(`  compsciStudent defaulted to false  ${normalised.compsciStudent}`)
  console.log(`  uoaID converted to a string        ${normalised.uoaID}`)
  console.log(
    `  members with no account to link    ${members.filter((member) => !member.betterAuthUserId).length}`,
  )

  if (skippedUsers.length > 0) {
    console.log(`\nUsers skipped, no member row (${skippedUsers.length}):`)
    for (const user of skippedUsers) {
      console.log(
        `  ${user.email}  name=${user.name ?? "-"}  verified=${user.emailVerified ?? "-"}`,
      )
    }
  }

  if (blockers.length > 0) {
    console.error(`\nAborting, ${blockers.length} problem(s) need a human decision:`)
    for (const blocker of blockers) console.error(`  - ${blocker}`)
    process.exitCode = 1
  } else if (!commit) {
    console.log("\nNothing written. Re-run with --commit to apply.")
  } else {
    const session = target.startSession()
    try {
      await session.withTransaction(async () => {
        if (membersToInsert.length > 0) {
          await to.collection(TARGET.member).insertMany(membersToInsert, { session })
        }
        if (usersToInsert.length > 0) {
          await to.collection(TARGET.user).insertMany(usersToInsert, { session })
        }
        if (accountsToInsert.length > 0) {
          await to.collection(TARGET.account).insertMany(accountsToInsert, { session })
        }
      })
    } finally {
      await session.endSession()
    }
    console.log("\nDone.")
  }
} catch (error) {
  console.error("Migration failed, nothing was committed:", error)
  process.exitCode = 1
} finally {
  await Promise.all([source.close(), target.close()])
}
