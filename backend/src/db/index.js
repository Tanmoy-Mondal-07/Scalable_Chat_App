import pool from "./pool.js";

const connectDB = async () => {
    try {
        await pool.connect
        console.log("connected to postgresql");
    } catch (error) {
        console.log("postgresql connection error", error);
        process.exit(1)
    }
}

export default connectDB;