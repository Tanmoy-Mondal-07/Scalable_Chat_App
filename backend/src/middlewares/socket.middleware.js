import jwt from "jsonwebtoken";
import { getUserByIdThroughRedisCache } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import cookie from "cookie";

const socketAuth = asyncHandler(async (socket, next) => {
    // console.log(socket);
    try {
        const rawCookie = socket.handshake.headers.cookie;

        if (!rawCookie) {
            throw new ApiError(403, "No cookies sent Unauthorized request");
        }

        const cookies = cookie.parse(rawCookie);
        const token = cookies.accessToken;

        // console.log(token);
        if (!token) throw new ApiError(401, "Unauthorized request")

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await getUserByIdThroughRedisCache(decoded.id);

        if (!user) throw new ApiError(401, "Invalid Access Token")

        socket.user = user;
        // console.log(user);
        next();
    } catch (err) {
        next(new Error("Authentication failed"));
    }
});

export default socketAuth;