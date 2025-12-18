import pool from "./PostgreSQL.client.js";

async function createUserTable() {
    const query = `
        CREATE TABLE IF NOT EXISTS users(
            id BIGSERIAL PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            avatar_url TEXT DEFAULT NULL
        );
    `;

    try {
        await pool.query(query);
        console.log("✅ PostgreSQL Table created");
    } catch (err) {
        console.error("❌ PostgreSQL migration error ::", err);
        await pool.end();
        process.exit(1)
    }
}

export default createUserTable;