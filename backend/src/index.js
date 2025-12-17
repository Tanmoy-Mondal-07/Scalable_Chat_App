import dotenv from "dotenv";
import { app } from "./app.js";
import createUserTable from "./db/PostgreSQL_user_schema.js";
import http from "http";
import SocketService from "./services/socket.js";
import initCassandra from "./db/Cassandra_chat_schema.js";

dotenv.config({
  path: './.env'
});

const server = http.createServer(app);
const socketService = new SocketService(server);
await initCassandra();

createUserTable()
  .then(() => {
    server.listen(process.env.PORT || 8000, () => {
      console.log("Server running on port", process.env.PORT || 8000);
    });
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
  });