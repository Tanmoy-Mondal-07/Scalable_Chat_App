import pool from "../db/PostgreSQL.client.js"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import redis from "../db/Redis.client.js";

export async function getAllUsers(offset) {
    const response = await pool.query(
        "SELECT * FROM users ORDER BY id LIMIT 50 OFFSET $1",
        [offset]
    )

    const users = response.rows.map(({ password_hash, ...userData }) => userData)

    const pipeline = redis.pipeline()
    for (const user of users) {
        pipeline.set(
            `profile:${user.id}`,
            JSON.stringify(user),
            "EX",
            10 * 24 * 60 * 60
        )
    }
    await pipeline.exec()

    return users
}

export async function fetchUsersInBulkById(ids) {
    if (!ids.length) return []

    const keys = ids.map(id => `profile:${id}`)
    const cachedResults = await redis.mget(...keys)

    const usersFromCache = []
    const missingIds = []

    cachedResults.forEach((value, index) => {
        if (value) {
            usersFromCache.push(JSON.parse(value))
        } else {
            missingIds.push(ids[index])
        }
    })

    let usersFromDb = []

    if (missingIds.length) {
        const response = await pool.query(
            `SELECT * FROM users WHERE id = ANY($1::int[])`,
            [missingIds]
        )

        usersFromDb = response.rows.map(
            ({ password_hash, ...user }) => user
        )

        const pipeline = redis.pipeline()

        for (const user of usersFromDb) {
            pipeline.set(
                `profile:${user.id}`,
                JSON.stringify(user),
                "EX",
                10 * 24 * 60 * 60
            )
        }

        await pipeline.exec()
    }

    const userMap = new Map()

    for (const user of [...usersFromCache, ...usersFromDb]) {
        userMap.set(user.id, user)
    }

    return ids.map(id => userMap.get(id)).filter(Boolean)
}

export async function getUserById(id) {
    const responce = await pool.query("SELECT * FROM users where id = $1", [id])
    return responce.rows[0]
}

export async function getUserByEmailIdOrUsername(email, username) {
    const responce = await pool.query("SELECT * FROM users where email = $1 OR username = $2 LIMIT 1", [email, username])
    return responce.rows[0]
}

export async function getUserByUsername(username) {
    const response = await pool.query(
        `SELECT *
       FROM users
       WHERE username ILIKE $1
       LIMIT 10`,
        [`%${username}%`]
    );

    return response.rows;
}

export async function getUserByIdentifier(identifier) {
    const responce = await pool.query("SELECT * FROM users where email = $1 OR username = $1 LIMIT 1", [identifier])
    return responce.rows[0]
}

export async function createUser({ email, username, hashedPassword }) {
    const responce = await pool.query("INSERT INTO users (username,email,password_hash) VALUES ($1,$2,$3) RETURNING *", [username, email, hashedPassword])
    return responce.rows[0]
}

export async function updateUserPassword(id, password) {
    const responce = await pool.query("UPDATE users SET password_hash=$1 WHERE id=$2 RETURNING *", [password, id])
    return responce.rows[0]
}

export async function updatedUsersAvatar(id, avatar_url) {
    const responce = await pool.query("UPDATE users SET avatar_url=$1 WHERE id=$2 RETURNING *", [avatar_url, id])
    return responce.rows[0]
}

export async function isPasswordCorrect(password, password_hash) {
    return await bcrypt.compare(password, password_hash)
}

export async function encriptPassword(password) {
    const encriptedPassword = await bcrypt.hash(password, 10)
    return encriptedPassword
}

export async function getUserByIdThroughRedisCache(id) {
    const cacheResponse = await redis.get(`profile:${id}`)

    if (!cacheResponse) {
        const response = await pool.query("SELECT * FROM users where id = $1", [id])
        const { password_hash, ...userData } = response.rows[0]
        await redis.set(`profile:${id}`, JSON.stringify(userData), "EX", 10 * 24 * 60 * 60);
        return userData
    } else return JSON.parse(cacheResponse);
}

export async function generateAccessToken(user) {
    return await jwt.sign(
        {
            id: user.id,
            email: user.email,
            username: user.username,
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

export async function generateRefreshToken(user) {
    return await jwt.sign(
        {
            id: user.id,
        },
        process.env.REFRSH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRSH_TOKEN_EXPIRY
        }
    )
}