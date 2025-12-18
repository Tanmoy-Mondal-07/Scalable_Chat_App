import client from "./cassandra.client.js";

export async function getConversationsByParticipant(participantId, pageState = null) {
    const query = `SELECT participant_id, last_message_at, conversation_id FROM chat.conversations WHERE participant_id = ?`;

    const options = { prepare: true, fetchSize: 50, };
    if (pageState) { options.pageState = pageState; }

    const result = await client.execute(query, [participantId], options);

    return { rows: result.rows, nextPageState: result.pageState, };
}
