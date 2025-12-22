import { kafka, producer } from "../db/Kafka.client.js";

export async function startFanoutConsumer() {
    const consumer = kafka.consumer({
        groupId: "message-fanout"
    });

    await consumer.connect();
    await consumer.subscribe({ topic: "chat_messages" });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const msg = JSON.parse(message.value.toString());

            // 1️⃣ Get participants (DB or Redis)
            // const participants = await getParticipants(msg.conversation_id);
            const participants = (msg.sender_id === msg.receiverId) ? [msg.sender_id] : [msg.sender_id, msg.receiverId]

            // 2️⃣ Produce per-user delivery messages
            await producer.send({
                topic: "chat_delivery",
                messages: participants.map(userId => ({
                    key: userId,
                    value: JSON.stringify({
                        ...msg,
                        recipient_id: userId
                    })
                }))
            });
        }
    });
}