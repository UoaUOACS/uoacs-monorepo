import { MongoClient } from "mongodb"

const uri = process.env.DATABASE_URI
if (!uri) throw new Error("DATABASE_URI is not set (the auth database to write)")

const commit = process.argv.includes("--commit")
const client = new MongoClient(uri)

// Copies each linked member's names onto their Better Auth user, for the rows
// that predate the Member collection's sync hook. Safe to re-run.
try {
  await client.connect()
  const db = client.db()
  console.log(db.databaseName)
  console.log(commit ? "mode: COMMIT\n" : "mode: dry run (pass --commit to write)\n")

  const members = await db
    .collection("members")
    .find(
      { betterAuthUserId: { $type: "string" } },
      { projection: { betterAuthUserId: 1, firstName: 1, lastName: 1 } },
    )
    .toArray()
  const users = await db
    .collection("user")
    .find({}, { projection: { _id: 1, firstName: 1, lastName: 1 } })
    .toArray()
  const usersById = new Map(users.map((user) => [String(user._id), user]))

  const updates = members.flatMap((member) => {
    const user = usersById.get(member.betterAuthUserId)
    if (!user) {
      console.warn(`  member ${member._id} points at missing user ${member.betterAuthUserId}`)
      return []
    }
    if (user.firstName === member.firstName && user.lastName === member.lastName) return []
    return [
      {
        updateOne: {
          filter: { _id: user._id },
          update: { $set: { firstName: member.firstName, lastName: member.lastName } },
        },
      },
    ]
  })

  console.log(`${updates.length} of ${users.length} users to update`)
  if (commit && updates.length > 0) {
    await db.collection("user").bulkWrite(updates)
    console.log("Done.")
  }
} catch (error) {
  console.error("Backfill failed:", error)
  process.exitCode = 1
} finally {
  await client.close()
}
