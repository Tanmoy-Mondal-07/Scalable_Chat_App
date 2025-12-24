import { kafka } from "../db/Kafka.client.js";
import msgpack from "msgpack-lite";

export async function startMessageDeliveryConsumer(io) {
    const consumer = kafka.consumer({
        groupId: "message-delivery"
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "chat_delivery" });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const msg = msgpack.decode(message.value);
            io.to(msg.recipient_id).emit("private:message", msg);
        }
    });
}