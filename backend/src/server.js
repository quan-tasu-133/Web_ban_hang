import express from "express";
import cors from "cors";
import pool from "./db/database.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Product API is running"
    });
});

app.use("/products", productRoutes);
app.use("/auth", authRoutes);

app.listen(5000, async () => {
    console.log("Server running at http://localhost:5000");

    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected!");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
});