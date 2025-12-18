import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js'
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from 'jsonwebtoken'
import { createUser, encriptPassword, fetchUsersInBulkById, generateAccessToken, generateRefreshToken, getAllUsers, getUserByEmailIdOrUsername, getUserById, getUserByIdentifier, getUserByIdThroughRedisCache, isPasswordCorrect } from "../models/user.model.js";
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
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    console.log("token refreshed");
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRSH_TOKEN_SECRET
        )

        const user = await getUserByIdThroughRedisCache(decodedToken.id)

        if (!user) {
            throw new ApiError(401, "invalid refresh token")
        }

        const redisRefreshToken = await redis.get(`refresh:${decodedToken.id}`)

        if (incomingRefreshToken !== redisRefreshToken) {
            throw new ApiError(401, "refresh token is expired or ushed")
        }

        const options = {
            httpOnly: true,
            secure: true,
            sameSite: "lax",
        }

        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: newrefreshToken },
                    "access token refreshed successfully"
                )
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid refresh token")
    }
})

const getUserProfileDetails = asyncHandler(async (req, res) => {
    const incomingUserId = req.body.id

    if (!incomingUserId) {
        throw new ApiError(404, "user id required")
    }

    try {
        const user = await getUserByIdThroughRedisCache(decodedToken.id)

        if (!user) {
            throw new ApiError(404, "invalid user Id")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, user, "User found"))
    } catch (error) {
        throw new ApiError(500, error?.message || "User not found")
    }
})

const getUsersWithPagination = asyncHandler(async (req, res) => {
    const offset = req.body.offset

    if (!offset && Number.isInteger(offset)) {
        throw new ApiError(404, "offset id required and its must be a Intiger")
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
        throw new ApiError(500, error?.message || "Users List not found")
    }
})

const getUsersWithIdsInBulk = asyncHandler(async (req, res) => {
    const idarray = req.body.idarray

    if (!idarray && idarray.length !== 0) {
        throw new ApiError(404, "id array is required")
    }

    const ids = idarray
        .filter(id =>
            Number.isInteger(id) ||
            (typeof id === "string" && /^\d+$/.test(id))
        )
        .map(String)

    try {
        const user = await fetchUsersInBulkById(ids)

        if (!user || user.length === 0) {
            throw new ApiError(404, "invalid user Ids")
        }

        return res
            .status(200)
            .json(new ApiResponse(200, user, "Users List"))
    } catch (error) {
        throw new ApiError(500, error?.message || "Users List not found")
    }
})

export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getUserProfileDetails,
    getUsersWithPagination,
    getUsersWithIdsInBulk
}