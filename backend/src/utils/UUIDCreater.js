import { v5 as uuidv5 } from "uuid";

const NAMESPACE = process.env.UUID_NAMESPACE;

export default function uuidFromUsers(userA, userB) {
  if (!userA || !userB) {
    throw new Error("Both user UUIDs are required");
  }

  const seed =
    userA < userB
      ? `${userA}:${userB}`
      : `${userB}:${userA}`;

  return uuidv5(seed, NAMESPACE);
}