import express from "express";
import cors from "cors";
import pool from "./db/database.js";
import productRoutes from "./routes/productRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import { authMiddleware } from "./middleware/authMiddleware.js";
import "dotenv/config";

const app = express();

app.use(cors());
app.use(express.json());

// Request Logger: In rõ ràng mọi request GET, POST, PUT, PATCH, DELETE trong Terminal Backend
app.use((req, res, next) => {
    const start = Date.now();
    res.on("finish", () => {
        const duration = Date.now() - start;
        console.log(`[HTTP] ${req.method.padEnd(6)} ${req.originalUrl} - Status: ${res.statusCode} (${duration}ms)`);
    });
    next();
});

app.get("/", (req, res) => {
    res.json({
        message: "Product API is running"
    });
});

app.get("/profile", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, created_at
             FROM users
             WHERE id = $1`,
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        res.json({
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể lấy thông tin tài khoản"
        });
    }
});

app.use("/products", productRoutes);
app.use("/auth", authRoutes);
app.use("/cart", cartRoutes);
app.use("/coupons", couponRoutes);
app.use("/orders", orderRoutes);
app.use("/admin", adminRoutes);

app.listen(5000, async () => {
    console.log("Server running at http://localhost:5000");

    try {
        await pool.query("SELECT NOW()");
        console.log("Database connected!");
    } catch (error) {
        console.error("Database connection failed:", error.message);
    }
});