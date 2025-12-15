import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import createUserTable from "./db/create_user_tables.js";

dotenv.config({
  path: './.env'
});

connectDB().then(()=>createUserTable())
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log("Server is running at port", process.env.PORT || 8000);
    });
  })
  .catch((err) => {
    console.log("MongoDB connection failed in src/index.js:", err);
  });