import client from "./cassandra.client.js";

const CREATE_KEYSPACE = `
CREATE KEYSPACE IF NOT EXISTS chat
WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'dc1': 2
};
`;

const CREATE_MESSAGES_TABLE = `
CREATE TABLE IF NOT EXISTS chat.messages (
  conversation_id UUID,
  message_ts TIMESTAMP,
  message_id UUID,
  sender_id UUID,
  content TEXT,
  PRIMARY KEY ((conversation_id), message_ts, message_id)
)
WITH CLUSTERING ORDER BY (message_ts DESC, message_id DESC);
`;

const CREATE_CONVERSATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS chat.conversations (
  participant_id UUID,
  peer_id UUID,
  last_message_at TIMESTAMP,
  conversation_id UUID,
  last_message TEXT,
  PRIMARY KEY ((participant_id), last_message_at, conversation_id)
)
WITH CLUSTERING ORDER BY (last_message_at DESC, conversation_id DESC);
`;

export default async function initCassandra() {
  try {
    await client.connect();

    await client.execute(CREATE_KEYSPACE);
    client.keyspace = "chat";

    await client.execute(CREATE_MESSAGES_TABLE);
    await client.execute(CREATE_CONVERSATIONS_TABLE);
    console.log("✅ Cassandra Table created");

  } catch (error) {
    console.log("❌ Cassandra connection fail ");
    console.log(error);
    process.exit(1)
  }
}