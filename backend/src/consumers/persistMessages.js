import { kafka } from "../db/Kafka.client.js";
import { uploadMessage } from "../models/message.model.js";

export async function startPersistenceConsumer() {
    const consumer = kafka.consumer({
        groupId: "message-persistence"
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "chat_messages" });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const msg = JSON.parse(message.value.toString());
            await uploadMessage(msg);
        }
    });
}