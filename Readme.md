# Scalable Chat Application Documentation

## Overview

This project is a **highly scalable real-time chat application** designed with a microservice-friendly, event-driven architecture. It currently supports **1-to-1 private messaging**, with the data models and Kafka-based fanout pipeline intentionally designed to **scale easily to group chats** in the future.

The system runs locally behind **NGINX on `http://localhost:5000`** and uses modern, production-grade technologies to handle **authentication, message persistence, fanout, delivery, caching, and rate limiting** at scale.

---

## Tech Stack

### Frontend

* **Next.js** – UI and client-side rendering
* **WebSockets (Socket.IO)** – Real-time message delivery

### Backend

* **Node.js + Express** – REST APIs and socket server
* **Kafka** – Message streaming, fanout, persistence, and delivery pipelines
* **MsgPack** – Efficient binary message serialization
* **NGINX** – Reverse proxy and entry point

### Databases & Caching

* **PostgreSQL** – User accounts, authentication, and relational data
* **Cassandra (Cluster-ready)** – Message storage and conversation timelines
* **Redis** –

  * Active user caching
  * Rate limiting
  * Fast-access session/state data

### Infrastructure

* **Docker & Docker Compose** – Local orchestration
* **Zookeeper** – Kafka coordination

---

## High-Level Architecture

```
Client (Next.js)
      ↓
   NGINX (Port 5000)
      ↓
Backend (Node.js + Express + Socket.IO)
      ↓
Kafka Topics
 ├─ chat_messages
 │   ├─ Persistence Consumer → Cassandra
 │   └─ Fanout Consumer → chat_delivery
 └─ chat_delivery
     └─ Delivery Consumer → Socket.IO
```

---

## Message Flow

1. Client sends a message via WebSocket / API
2. Backend publishes the message to **Kafka (`chat_messages`)**
3. Kafka consumers process the message in parallel:

   * **Persistence Consumer** stores it in Cassandra
   * **Fanout Consumer** determines recipients and republishes to `chat_delivery`
4. **Delivery Consumer** pushes the message to online users via Socket.IO

This separation allows **horizontal scaling** of each responsibility independently.

---

## Database Design

### PostgreSQL (Users)

Used for strongly consistent relational data such as users and authentication.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT DEFAULT NULL
);
```

---

### Cassandra (Chat Data)

Optimized for high-write throughput and time-series queries.

#### Keyspace

```sql
CREATE KEYSPACE chat
WITH replication = {
  'class': 'NetworkTopologyStrategy',
  'dc1': 2
};
```

#### Messages Table

Stores messages per conversation, ordered by timestamp.

```sql
CREATE TABLE chat.messages (
  conversation_id UUID,
  message_ts TIMESTAMP,
  message_id UUID,
  sender_id UUID,
  content TEXT,
  PRIMARY KEY ((conversation_id), message_ts, message_id)
)
WITH CLUSTERING ORDER BY (message_ts DESC, message_id DESC);
```

#### Conversations Table

Stores per-user conversation lists.

```sql
CREATE TABLE chat.conversations (
  participant_id UUID,
  peer_id UUID,
  last_message_at TIMESTAMP,
  conversation_id UUID,
  last_message TEXT,
  PRIMARY KEY ((participant_id), last_message_at, conversation_id)
)
WITH CLUSTERING ORDER BY (last_message_at DESC, conversation_id DESC);
```

---

## Redis Usage

Redis is used for:

* **Active user tracking** (online/offline state)
* **Rate limiting** (API & auth endpoints)
* **Low-latency cached data**

This reduces load on PostgreSQL and improves overall responsiveness.

---

## Kafka Topics & Consumers

### Topics

* `chat_messages` – Main message pipeline
* `chat_delivery` – User-specific delivery channel

### Consumers

#### 1. Persistence Consumer

* Saves messages to Cassandra
* Decouples storage from request latency

#### 2. Fanout Consumer

* Determines message recipients
* Publishes per-user messages to `chat_delivery`
* Designed to support **group chats** by expanding participants

#### 3. Delivery Consumer

* Pushes messages to connected users via Socket.IO

---

## API Structure

### User Routes (`/api/v1/users`)

**Public**

* `POST /register`
* `POST /login` (rate limited)
* `POST /refresh-token`

**Protected**

* `POST /logout`
* `POST /getallusers`
* `POST /getcurrentuser`
* `POST /searchusers`

---

### Chat Routes (`/api/v1/chat`)

* `POST /messages` – Fetch messages for a conversation
* `POST /current-user` – Fetch user conversations

All routes are protected using **JWT authentication** and **rate limiting**.

---

## Security

* **JWT-based authentication** with refresh tokens
* **HTTP-only cookies** for tokens
* **Rate limiting** using Redis
* **CORS protection**
* **NGINX reverse proxy**

---

## Docker & Local Setup

The entire stack runs using **Docker Compose**:

Services included:

* Redis
* PostgreSQL
* Cassandra (single-node, cluster-ready)
* Zookeeper
* Kafka
* Backend
* Frontend
* NGINX (port 5000)

```bash
docker-compose up --build
```

Access the app at:

```
http://localhost:5000
```

---

## Scalability Considerations

* Kafka allows **horizontal scaling** of consumers
* Cassandra supports **multi-node clusters** for high availability
* Redis offloads frequent reads and rate limiting
* Stateless backend enables easy replication

### Group Chat Ready

To support group chats:

* Replace 1v1 participant logic in the fanout consumer
* Fetch participant lists per conversation
* No schema or architecture changes required

---

## Future Improvements

* Group chat support
* Message acknowledgements & read receipts
* Offline message queueing
* Media attachments
* Observability (Prometheus + Grafana)

---

## Summary

This project demonstrates a **production-grade, event-driven chat system** built with scalability, performance, and extensibility in mind. By combining Kafka, Cassandra, Redis, and Node.js, it cleanly separates concerns and is ready to scale from local development to distributed production environments.