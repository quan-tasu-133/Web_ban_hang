import express from "express";

import {
    getCart,
    addToCart,
    updateCartItem,
    deleteCartItem,
    clearCart
} from "../controllers/cartController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCart);

router.post("/", authMiddleware, addToCart);

router.patch("/:productId", authMiddleware, updateCartItem);

router.delete("/",authMiddleware,clearCart);

router.delete("/:productId",authMiddleware,deleteCartItem);

export default router;