import { kafka } from "../db/Kafka.client.js";
import { uploadMessage } from "../models/message.model.js";
import msgpack from "msgpack-lite";

export async function startPersistenceConsumer() {
    const consumer = kafka.consumer({
        groupId: "message-persistence"
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "chat_messages" });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const msg = msgpack.decode(message.value);
            await uploadMessage(msg);
        }
    });
}