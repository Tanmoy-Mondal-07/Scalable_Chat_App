import { kafka } from "../db/Kafka.client.js";

export async function startMessageDeliveryConsumer(io) {
    const consumer = kafka.consumer({
        groupId: "message-delivery"
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "chat_delivery" });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const msg = JSON.parse(message.value.toString());
            io.to(msg.recipient_id).emit("private:message", msg);
        }
    });
}