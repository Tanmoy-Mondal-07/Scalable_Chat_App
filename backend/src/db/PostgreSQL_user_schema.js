import pool from "./PostgreSQL.client.js";

async function createUserTable() {
  const enableUUID = `
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";
  `;

  const query = `
    CREATE TABLE IF NOT EXISTS users(
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) UNIQUE NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_url TEXT DEFAULT NULL
    );
  `;

  try {
    await pool.query(enableUUID);
    await pool.query(query);
    console.log("✅ PostgreSQL Table created");
  } catch (err) {
    console.error("❌ PostgreSQL migration error ::", err);
    await pool.end();
    process.exit(1);
  }
}

export default createUserTable;