import { kafka, producer } from "../db/Kafka.client.js";
import msgpack from "msgpack-lite";

export async function startFanoutConsumer() {
    const consumer = kafka.consumer({
        groupId: "message-fanout"
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "chat_messages" });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const msg = msgpack.decode(message.value);

            // const participants = await getParticipants(msg.conversation_id);
            const participants = (msg.sender_id === msg.receiverId) ? [msg.sender_id] : [msg.sender_id, msg.receiverId]

            await producer.send({
                topic: "chat_delivery",
                messages: participants.map(userId => ({
                    key: userId,
                    value: msgpack.encode({
                        ...msg,
                        recipient_id: userId,
                    }),
                }))
            });
        }
    });
}