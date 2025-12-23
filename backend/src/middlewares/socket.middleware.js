import jwt from "jsonwebtoken";
import { getUserByIdThroughRedisCache } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cookie from "cookie";
import { socketRateLimit } from "../services/socketRateLimit.js";

const socketAuth = async (socket, next) => {
    // console.log(socket);
    try {
        const rawCookie = socket.handshake.headers.cookie;
        const ip = socket.handshake.address?.replace(/:/g, "_");

        const allowed = await socketRateLimit({
            key: `connect:${ip}`,
            limit: 20,
            windowSec: 60,
        });

        if (!allowed) throw new ApiError(429, "Too many connections");
        if (!rawCookie) throw new ApiError(403, "No cookies sent Unauthorized request");

        const cookies = cookie.parse(rawCookie);
        const token = cookies.accessToken;

        if (!token) throw new ApiError(401, "Unauthorized request")

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await getUserByIdThroughRedisCache(decoded.id);

        if (!user) throw new ApiError(401, "Invalid Access Token")

        socket.user = user;
        next();
    } catch (err) {
        throw new ApiError(500, err.message || "Authentication failed");
    }
};

export default socketAuth;