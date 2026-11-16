import { updateMemberSchema } from "@uoacs/shared/payload"
import { ValidationError } from "payload"
import { ZodError } from "zod"
import { getSession } from "@/lib/auth/auth-session"
import { DuplicateFieldError, MemberService } from "@/services/member.service"

const members = new MemberService()

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const member = await members.findByUserId(session.user.id)
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 })

  return Response.json(member)
}

export async function PATCH(request: Request) {
  const session = await getSession()
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const member = await members.findByUserId(session.user.id)
  if (!member) return Response.json({ error: "Member not found" }, { status: 404 })

  try {
    const data = updateMemberSchema.parse(await request.json())

    // Payload's own validate hook can't see the stored row on a partial update,
    // so the cross-field rule is re-checked against the merged result here.
    const compsciStudent = data.compsciStudent ?? member.compsciStudent
    const otherMajors = data.otherMajors ?? member.otherMajors
    if (compsciStudent === false && (!otherMajors || otherMajors.length === 0)) {
      return Response.json(
        { error: [{ field: "otherMajors", message: "Please enter your major(s)" }] },
        { status: 400 },
      )
    }

    const updated = await members.update(member.id, data)
    return Response.json(updated)
  } catch (err) {
    if (err instanceof SyntaxError) {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 })
    }
    if (err instanceof ZodError) {
      const error = err.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
      return Response.json({ error }, { status: 400 })
    }
    if (err instanceof DuplicateFieldError) {
      return Response.json(
        { error: [{ field: err.field, message: "Value already in use" }] },
        { status: 409 },
      )
    }
    if (err instanceof ValidationError) {
      const error =
        err.data?.errors?.map((e) => ({ field: e.path ?? "", message: e.message })) ?? []
      return Response.json({ error }, { status: 422 })
    }
    console.error("[PATCH /api/member/me] Unhandled error", { memberId: member.id, error: err })
    return Response.json({ error: "Internal server error" }, { status: 500 })
  }
}
