import express from "express";
import {
    getProductReviews,
    addOrUpdateReview,
    deleteReview
} from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/products/:productId/reviews", getProductReviews);
router.post("/products/:productId/reviews", authMiddleware, addOrUpdateReview);
router.delete("/reviews/:id", authMiddleware, deleteReview);

export default router;
