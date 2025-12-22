import dotenv from "dotenv";
import { app } from "./app.js";
import createUserTable from "./db/PostgreSQL_user_schema.js";
import http from "http";
import SocketService from "./services/socket.js";
import initCassandra from "./db/Cassandra_chat_schema.js";
import { startFanoutConsumer } from "./consumers/fanout.js";
import { startPersistenceConsumer } from "./consumers/persistMessages.js";

dotenv.config({
  path: './.env'
});

const server = http.createServer(app);
new SocketService(server);

await createUserTable()
await initCassandra();
await startFanoutConsumer();
await startPersistenceConsumer();

try {
  server.listen(process.env.PORT || 8000, () => {
    console.log("Server running on port", process.env.PORT || 8000);
  })
} catch (error) {
  console.error("DB connection failed:", error);
}