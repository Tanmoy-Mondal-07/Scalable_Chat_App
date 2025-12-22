import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: "chat-app",
    brokers: [process.env.KAFKA_BROKERS]
});

export const producer = kafka.producer({
    allowAutoTopicCreation: false,
    idempotent: true
});

await producer.connect();