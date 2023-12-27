import { MongoClient, ObjectId } from "mongodb";
import randomstring from "randomstring";
import { createHash, randomUUID } from "node:crypto";

const client = new MongoClient(import.meta.env.DB_URL);

await client.connect();

const db = client.db("db");
const users = db.collection("users");
const redirects = db.collection("redirects");

export async function newRedirect(from: string, to: string, belongsTo: string) {
  const user = (await users.findOne({ session: belongsTo }))?._id!;
  await redirects.insertOne({
    from,
    to,
    belongsTo: user,
  });
}

export async function getRedirect(from: string) {
  const redirect = await redirects.findOne({ from });
  if (redirect === null) return null;
  return redirect.to as string;
}

export async function editRedirect(from: string, to: string) {
  await redirects.updateOne({ from }, { $set: { to } });
}

export async function deleteRedirect(from: string) {
  await redirects.deleteOne({ from });
}

export async function newUser(username: string, password: string) {
  const salt = randomstring.generate(32);
  await users.insertOne({
    username,
    password: createHash("sha256")
      .update(password + salt)
      .digest("hex"),
    salt,
  });
}

export async function validateUser(username: string, password: string) {
  const user = await users.findOne({ username });
  if (user === null) return false;
  return (
    createHash("sha256")
      .update(password + user.salt)
      .digest("hex") === user.password
  );
}

export async function changePassword(session: string, password: string) {
  const salt = randomstring.generate(32);
  await users.updateOne(
    { session },
    {
      $set: {
        password: createHash("sha256")
          .update(password + salt)
          .digest("hex"),
        salt,
      },
    },
  );
}

export async function newSession(username: string) {
  const session = randomUUID();
  await users.updateOne({ username }, { $set: { session } });
  return session;
}

export async function listRedirects(session: string) {
  const user = await users.findOne({ session });
  if (user === null) return [];
  return await redirects.find({ belongsTo: user._id }).sort({ from: 1 }).toArray();
}
