import express from "express";
import {
    getCoupons,
    createCoupon,
    deleteCoupon,
    toggleCouponStatus,
    applyCoupon
} from "../controllers/couponController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

// Khách hàng áp dụng mã
router.post("/apply", applyCoupon);

// Admin quản lý mã
router.get("/", authMiddleware, adminMiddleware, getCoupons);
router.post("/", authMiddleware, adminMiddleware, createCoupon);
router.patch("/:id/toggle", authMiddleware, adminMiddleware, toggleCouponStatus);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCoupon);

export default router;
