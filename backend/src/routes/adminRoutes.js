import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";
import {
    getAllUsers,
    updateUserRole,
    deleteUser
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/test", authMiddleware, adminMiddleware, (req, res) => {
    res.json({
        message: "Bạn đã truy cập khu vực Admin"
    });
});

// User Management Routes
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);
router.patch("/users/:id/role", authMiddleware, adminMiddleware, updateUserRole);
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

export default router;
