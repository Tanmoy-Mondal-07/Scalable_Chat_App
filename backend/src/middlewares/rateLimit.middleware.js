import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redis from "../db/Redis.client.js";

export const apiLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),

    windowMs: 60 * 1000,
    max: 100,

    keyGenerator: (req) => {
        if (req.user?.id) return req.user.id;
        return ipKeyGenerator(req);
    },

    standardHeaders: true,
    legacyHeaders: false,
});

export const loginLimiter = rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),

    windowMs: 60 * 1000,
    max: 5,
    keyGenerator: (req) => ipKeyGenerator(req),
    standardHeaders: true,
    legacyHeaders: false,
});