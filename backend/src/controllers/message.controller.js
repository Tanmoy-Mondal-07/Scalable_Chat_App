import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from "../utils/ApiResponse.js";
import { fetchMessagesByConversationId, fetchTopConversationsByUserId } from "../models/message.model.js";
import { fetchUsersInBulkById } from "../models/user.model.js";
import uuidFromUsers from "../utils/UUIDCreater.js";

const getMessages = asyncHandler(async (req, res) => {
    const { receiverId } = req.body;
    const senderId = req.user.id

    if (!senderId || !receiverId) {
        throw new ApiError(400, "Sender ID and Receiver ID are required");
    }

    const Messages = await fetchMessagesByConversationId({ conversation_id: uuidFromUsers(senderId, receiverId) });

    return res
        .status(201)
        .json(new ApiResponse(201, Messages, "Messages found"));
});

const fetchMessagesByConversation = asyncHandler(async (req, res) => {
    const { conversation_id } = req.body;

    if (!conversation_id) {
        throw new ApiError(400, "Conversation ID is required");
    }

    const messages = await fetchMessagesByConversationId({ conversation_id });

    return res
        .status(200)
        .json(new ApiResponse(200, messages || [], "Messages fetched successfully"));
});

const fetchCurrentUserConversation = asyncHandler(async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const conversations = await fetchTopConversationsByUserId({ userId });

    if (!conversations || conversations.length === 0) {
        return res.status(200).json(
            new ApiResponse(200, [], "No conversations found")
        );
    }

    const peerIds = conversations.map(conversation => conversation.peer_id.toString());

    const users = await fetchUsersInBulkById(peerIds);

    const usersById = Object.fromEntries(
        users.map(user => [user.id, user])
    );

    const enrichedConversations = conversations.map(conversation => {
        const user = usersById[conversation.peer_id];

        if (!user) return conversation;

        return {
            ...conversation,
            username: user.username,
            avatar_url: user.avatar_url,
        };
    });

    return res.status(200).json(
        new ApiResponse(
            200,
            enrichedConversations,
            "User conversations retrieved successfully"
        )
    );
});

export {
    getMessages,
    fetchCurrentUserConversation
};