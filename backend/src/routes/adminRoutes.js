import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
    res.json({
        message: "Bạn đã truy cập khu vực Admin"
    });
});

export default router;