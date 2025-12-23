import redis from "../db/Redis.client.js";

export async function socketRateLimit({ key, limit, windowSec, }) {

    const redisKey = `socket:rate:${key}`;
    const count = await redis.incr(redisKey);

    if (count === 1) {
        await redis.expire(redisKey, windowSec);
    }

    return count <= limit;
}