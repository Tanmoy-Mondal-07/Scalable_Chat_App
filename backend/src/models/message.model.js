import cassandra from "cassandra-driver";
import uuidFromUsers from "../utils/UUIDCreater";
const randomUuid = cassandra.types.Uuid.random();

async function createConversationsInfoCassandra({ senderId, receiverId, timestamps = Date.now() }) {
    conversationId = uuidFromUsers(senderId, receiverId)
    const query = `BEGIN UNLOGGED BATCH
      INSERT INTO conversations (participant_id, last_message_at, conversation_id) VALUES (?, ?, ?);
      INSERT INTO conversations (participant_id, last_message_at, conversation_id) VALUES (?, ?, ?);
      APPLY BATCH; `;

    await cassandra.execute(
        query, [
        senderId, new Date(timestamps), conversationId,
        receiverId, new Date(timestamps), conversationId,
    ], { prepare: true });
}

export {
    createConversationsInfoCassandra,
}