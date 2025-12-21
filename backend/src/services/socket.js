import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import socketAuth from "../middlewares/socket.middleware.js";
import redis from "../db/Redis.client.js";
// import { producer } from "../db/Kafka.client.js";
import { v4 as uuid } from "uuid";
import { uploadMessage } from "../models/message.model.js";
import uuidFromUsers from "../utils/UUIDCreater.js";

class SocketService {
    constructor(httpServer) {
        const pubClient = redis
        const subClient = pubClient.duplicate();

        this.io = new Server(httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN,
                credentials: true,
            },
        });

        this.io.adapter(createAdapter(pubClient, subClient));
        this.io.use(socketAuth);
        this.initListeners();

        pubClient.on("connect", () => console.log("pubClient connecting..."));
        pubClient.on("ready", () => console.log("pubClient ready"));
        pubClient.on("error", (err) => console.error("pubClient error:", err));

        subClient.on("connect", () => console.log("subClient connecting..."));
        subClient.on("ready", () => console.log("subClient ready"));
        subClient.on("error", (err) => console.error("subClient error:", err));
        subClient.on("end", () => console.warn("subClient connection closed"));
        subClient.on("reconnecting", () => console.log("subClient reconnecting..."));

        subClient.on("subscribe", (channel, count) => { console.log(`✅ Subscribed to ${channel} (${count} subscriptions total)`); });
        subClient.on("message", (channel, message) => { console.log(`📥 Message on ${channel}: ${message}`); });
    }

    initListeners() {
        this.io.on("connection", (socket) => {
            const userId = socket.user.id;

            socket.join(userId);
            console.log(`User ${userId} connected`);

            socket.on("private:message", (payload) => {
                const message = {
                    conversation_id: uuidFromUsers(userId, payload.toUserId),
                    message_ts: Date.now(),
                    message_id: uuid(),
                    sender_id: userId,
                    content: payload.message
                }
                console.log(message);
                uploadMessage({ ...message, receiverId: payload.toUserId })
                this.io.to(payload.toUserId).emit("private:message", message);
            });
        });

        // this.io.on("connection", (socket) => {
        //     socket.on("send_message", async (payload) => {
        //         const message = {
        //             message_id: uuid(),
        //             conversation_id: payload.conversationId,
        //             sender_id: socket.id,
        //             content: payload.text,
        //             ts: Date.now()
        //         };

        //         await producer.send({
        //             topic: "chat_messages",
        //             messages: [
        //                 {
        //                     key: message.conversation_id, // ORDERING GUARANTEE
        //                     value: JSON.stringify(message)
        //                 }
        //             ]
        //         });

        //         socket.emit("ack", { message_id: message.message_id });
        //     });
        // });
    }
}

export default SocketService;