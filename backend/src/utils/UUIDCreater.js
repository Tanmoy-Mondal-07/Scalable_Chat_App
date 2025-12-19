import { v5 as uuidv5 } from "uuid";

const NAMESPACE = process.env.UUID_NAMESPACE;

export default function uuidFromUsers(userA, userB) {
  const a = BigInt(userA);
  const b = BigInt(userB);

  const seed = a < b
    ? `${a}:${b}`
    : `${b}:${a}`;

  return uuidv5(seed, NAMESPACE);
}