import express from "express";
import pool from "./db/database.js";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Task Manager API is running"
    });
});

app.get("/tasks", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM tasks");

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.post("/tasks", async (req, res) => {
    try {
        const { title } = req.body;

        const result = await pool.query(
            "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
            [title]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.patch("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, completed } = req.body;

        const result = await pool.query(
            `UPDATE tasks
             SET title = COALESCE($1, title),
                 completed = COALESCE($2, completed)
             WHERE id = $3
             RETURNING *`,
            [title, completed, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.delete("/tasks/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM tasks WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully",
            task: result.rows[0]
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Database error"
        });
    }
});

app.listen(5000, async () => {
    console.log("Server running at http://localhost:5000");

    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected!");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
});