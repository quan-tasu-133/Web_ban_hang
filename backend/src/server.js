import express from "express";
import pool from "./db/database.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Task Manager API is running"
    });
});

app.use("/tasks", taskRoutes);

app.listen(5000, async () => {
    console.log("Server running at http://localhost:5000");

    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected!");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
});