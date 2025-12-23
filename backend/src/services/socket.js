import { Server } from "socket.io";
import { createAdapter } from "@socket.io/redis-adapter";
import socketAuth from "../middlewares/socket.middleware.js";
import redis from "../db/Redis.client.js";
import { producer } from "../db/Kafka.client.js";
import { v4 as uuid } from "uuid";
import uuidFromUsers from "../utils/UUIDCreater.js";
import { startMessageDeliveryConsumer } from "../consumers/delivery.js";
import { socketRateLimit } from "./socketRateLimit.js";

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
        startMessageDeliveryConsumer(this.io);
        this.initListeners();

        pubClient.on("connect", () => console.log("pubClient connecting..."));
        pubClient.on("ready", () => console.log("pubClient ready"));
        pubClient.on("error", (err) => console.error("pubClient error:", err));

        subClient.on("connect", () => console.log("subClient connecting..."));
        subClient.on("ready", () => console.log("subClient ready"));
        subClient.on("error", (err) => console.error("subClient error:", err));
        subClient.on("end", () => console.warn("subClient connection closed"));
        subClient.on("reconnecting", () => console.log("subClient reconnecting..."));
    }

    initListeners() {
        this.io.on("connection", (socket) => {
            const userId = socket.user.id;
            const ip = socket.handshake.headers["x-forwarded-for"]?.split(",")[0] || socket.handshake.address;

            socket.join(userId);
            console.log(`User ${userId} connected`);

            socket.on("private:message", async (payload, ack) => {

                const allowed = await socketRateLimit({
                    key: userId ? `user:${userId}` : `ip:${ip}`,
                    limit: 10,
                    windowSec: 1,
                });

                if (!allowed) {
                    return ack?.({
                        ok: false,
                        error: "RATE_LIMIT",
                        message: "Too many messages",
                    });
                }

                const message = {
                    conversation_id: uuidFromUsers(userId, payload.toUserId),
                    message_ts: Date.now(),
                    message_id: uuid(),
                    sender_id: userId,
                    content: payload.message,
                    receiverId: payload.toUserId
                };

                await producer.send({
                    topic: "chat_messages",
                    messages: [{
                        key: message.conversation_id,
                        value: JSON.stringify(message)
                    }]
                });
                ack?.({ ok: true });
            });

            // socket.on("private:message", (payload) => {
            //     const message = {
            //         conversation_id: uuidFromUsers(userId, payload.toUserId),
            //         message_ts: Date.now(),
            //         message_id: uuid(),
            //         sender_id: userId,
            //         content: payload.message
            //     }
            //     console.log(message);
            //     uploadMessage({ ...message, receiverId: payload.toUserId })
            //     this.io.to(payload.toUserId).emit("private:message", message)
            //     this.io.to(userId).emit("private:message", message);
            // });
        });
    }
}

export default SocketService;