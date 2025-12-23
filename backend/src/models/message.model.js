import client from "../db/cassandra.client.js";

// async function createConversationsInfoCassandra({ senderId, receiverId, timestamps = Date.now() }) {
//     const conversationId = uuidFromUsers(senderId, receiverId)
//     const query = `BEGIN UNLOGGED BATCH
//       INSERT INTO chat.conversations (participant_id, last_message_at, conversation_id) VALUES (?, ?, ?);
//       INSERT INTO chat.conversations (participant_id, last_message_at, conversation_id) VALUES (?, ?, ?);
//       APPLY BATCH; `;

//     await client.execute(
//         query, [
//         senderId, new Date(timestamps), conversationId,
//         receiverId, new Date(timestamps), conversationId,
//     ], { prepare: true });

//     return {
//         conversation_id: conversationId,
//         participant_id: senderId,
//         last_message_at: new Date(timestamps)
//     };
// }

// async function fetchConversationByUsers({
//     senderId,
//     receiverId,
// }) {
//     const conversationId = uuidFromUsers(senderId, receiverId);
//     // console.log(conversationId);
//     const query = `
//       SELECT participant_id, conversation_id, last_message_at
//       FROM chat.conversations
//       WHERE participant_id = ? AND conversation_id = ?
//     `;

//     const result = await client.execute(
//         query,
//         [senderId, conversationId],
//         { prepare: true }
//     );
//     return result?.rows[0];
// }

async function uploadMessage({
    conversation_id,
    sender_id,
    receiverId,
    content,
    message_ts = Date.now(),
    message_id
}) {
    const ts = new Date(message_ts);
    const query = `
      BEGIN UNLOGGED BATCH
        INSERT INTO chat.messages (
          conversation_id, message_ts, message_id, sender_id, content
        ) VALUES (?, ?, ?, ?, ?);
  
        INSERT INTO chat.conversations (
          participant_id, peer_id, last_message_at, conversation_id, last_message
        ) VALUES (?, ?, ?, ?, ?);
  
        INSERT INTO chat.conversations (
          participant_id, peer_id, last_message_at, conversation_id, last_message
        ) VALUES (?, ?, ?, ?, ?);
      APPLY BATCH;
    `;

    await client.execute(
        query,
        [
            conversation_id, ts, message_id, sender_id, content,
            sender_id, receiverId, ts, conversation_id, content,
            receiverId, sender_id, ts, conversation_id, content,
        ],
        { prepare: true }
    );

    return {
        message_id: message_id,
        conversation_id: conversation_id,
        sender_id: sender_id,
        content,
        message_ts: ts,
    };
}

async function fetchMessagesByConversationId({
    conversation_id,
    limit = 50,
    pagingState = null,
}) {
    const query = `
      SELECT conversation_id, message_ts, message_id, sender_id, content
      FROM chat.messages
      WHERE conversation_id = ?
      LIMIT ?
    `;

    const result = await client.execute(
        query,
        [conversation_id, limit],
        {
            prepare: true,
            fetchSize: limit,
            pagingState,
        }
    );

    return result.rows
}

async function fetchMessagesByConversationIds({
    conversationIds,
    limitPerConversation = 20,
}) {
    const query = `
      SELECT conversation_id, message_ts, message_id, sender_id, content
      FROM chat.messages
      WHERE conversation_id = ?
      LIMIT ?
    `;

    const queries = conversationIds.map((conversationId) =>
        client.execute(
            query,
            [conversationId, limitPerConversation],
            { prepare: true }
        )
    );

    const results = await Promise.all(queries);

    return results.flatMap((res) => res.rows);
}


async function fetchTopConversationsByUserId({ userId }) {
    const query = `
      SELECT peer_id, conversation_id, last_message_at, last_message
      FROM chat.conversations
      WHERE participant_id = ?
      LIMIT 500
    `;
    const result = await client.execute(
        query,
        [userId],
        { prepare: true }
    );

    const map = new Map();

    for (const row of result.rows) {
        const convoId = row.conversation_id.toString();
        if (!map.has(convoId)) {
            map.set(convoId, row);
        }
    }

    return [...map.values()];
}


export {
    uploadMessage,
    fetchMessagesByConversationId,
    fetchTopConversationsByUserId,
    fetchMessagesByConversationIds,
}