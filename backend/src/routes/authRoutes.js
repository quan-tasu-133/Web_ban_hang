import express from "express";
import {
    register,
    login,
    updateName,
    updatePassword
} from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/profile/name", authMiddleware, updateName);
router.put("/profile/password", authMiddleware, updatePassword);

export default router;