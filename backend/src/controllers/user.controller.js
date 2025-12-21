import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'
import { createUser, encriptPassword, fetchUsersInBulkById, generateAccessToken, generateRefreshToken, getAllUsers, getUserByEmailIdOrUsername, getUserById, getUserByIdentifier, getUserByIdThroughRedisCache, getUserByUsername, isPasswordCorrect } from "../models/user.model.js";
import redis from "../db/Redis.client.js";


const generateAccessAndRefreshTokens = async (user) => {
    try {
        const accessToken = await generateAccessToken(user)
        const refreshToken = await generateRefreshToken(user)

        await redis.set(`refresh:${user.id}`, refreshToken, "EX", 10 * 24 * 60 * 60);

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "somthing went wrong while genarating Access And Refresh token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { email, username, password } = req.body
    const emailRegex = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/

    if (
        [email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    } else if (!emailRegex.test(email)) throw new ApiError(402, "invalid email id")

    const existedUser = await getUserByEmailIdOrUsername(email, username)

    if (existedUser) {
        throw new ApiError(409, "user with email or username alrady exist")
    }

    const hashedPassword = await encriptPassword(password)

    const user = await createUser({
        email,
        hashedPassword,
        username,
    })
    // console.log(user);

    const createdUser = await getUserById(user.id)

    if (!createdUser) {
        throw new ApiError(500, "somthing wrong while registering the user")
    }

    const { password_hash, ...createdUserData } = createdUser

    return res.status(200).json(
        new ApiResponse(200, createdUserData, "User registerd successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {

    const { identifier, password } = req.body

    if (!identifier) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await getUserByIdentifier(identifier)

    if (!user) {
        throw new ApiError(404, "user dosent exist")
    }

    const ispasswordValid = await isPasswordCorrect(password, user.password_hash)

    if (!ispasswordValid) {
        throw new ApiError(401, "invalid user credential")
    }

    const loggedInUser = await getUserByIdThroughRedisCache(user.id)

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(loggedInUser)

    const options = {
        httpOnly: true,
        // secure: true,
        // sameSite: "lax",
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken
                },
                "user logged in succesfully"
            )
        )
})

const logoutUser = asyncHandler(async (req, res) => {
    await redis.del(`refresh:${req.user.id}`)

    const options = {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken;

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Unauthorized");
    }

    const decoded = jwt.verify(
        incomingRefreshToken,
        process.env.REFRSH_TOKEN_SECRET
    );

    const redisToken = await redis.get(`refresh:${decoded.id}`);

    if (!redisToken || redisToken !== incomingRefreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const user = await getUserByIdThroughRedisCache(decoded.id);

    const accessToken = await generateAccessToken(user);

    const cookieOptions = {
        httpOnly: true,
        // secure: false,
        // sameSite: "lax",
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .json(
            new ApiResponse(
                200,
                { user, accessToken },
                "access token refreshed successfully"
            )
        )
});

const getUserProfileDetailsByName = asyncHandler(async (req, res) => {
    const username = req.body.username

    if (!username) {
        throw new ApiError(404, "user name is required")
    }

    try {
        const users = await getUserByUsername(username)

        if (users.length === 0) {
            throw new ApiError(404, "no user found with this username")
        }

        const filtredUsers = users.map(({ password_hash, email, ...filterdUser }) => filterdUser)

        return res
            .status(200)
            .json(new ApiResponse(200, filtredUsers, "Users found"))
    } catch (error) {
        throw new ApiError(500, error?.message || "server error")
    }
})

const getTheCurentUserProfileDetails = asyncHandler(async (req, res) => {
    const incomingRefreshToken =
        req.cookies.refreshToken || req.body.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(401, "Not authenticated")
    }

    let decodedToken
    try {
        decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRSH_TOKEN_SECRET
        )
    } catch {
        throw new ApiError(401, "Invalid refresh token")
    }

    const user = await getUserByIdThroughRedisCache(decodedToken.id)

    if (!user) {
        throw new ApiError(401, "User not found")
    }

    const redisRefreshToken = await redis.get(`refresh:${decodedToken.id}`)

    if (!redisRefreshToken || redisRefreshToken !== incomingRefreshToken) {
        throw new ApiError(401, "Refresh token expired or reused")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user)

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                { user },
                "Authenticated"
            )
        )
})

const getUsersWithPagination = asyncHandler(async (req, res) => {
    const offset = req.body?.offset || 0

    if (!Number.isInteger(offset)) {
        throw new ApiError(404, "offset must be a Intiger")
    }

    try {
        const user = await getAllUsers(offset)

        if (!user || user.length === 0) {
            throw new ApiError(404, "no user found")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, user, "50 Users List, shorted by Id"))
    } catch (error) {
        console.log(error);
        throw new ApiError(500, error?.message || "Users List not found")
    }
})

const getUsersById = asyncHandler(async (req, res) => {
    const id = req.body.id

    if (!id) {
        throw new ApiError(404, "id is required")
    }

    try {
        const user = await getUserById(id)

        if (!user) {
            throw new ApiError(404, "invalid user Id")
        }

        const { password_hash, email, ...filterdUser } = user

        return res
            .status(200)
            .json(new ApiResponse(200, filterdUser, "Users List"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Users List not found")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfileDetailsByName,
    getUsersWithPagination,
    getUsersById,
    getTheCurentUserProfileDetails
}