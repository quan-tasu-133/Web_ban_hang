import express from "express";
import {
    getProducts,
    getBrands,
    createProduct,
    getProductById,
    updateProduct,
    deleteProduct
} from "../controllers/productController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/brands", getBrands);
router.get("/:id", getProductById);

router.post(
    "/",
    authMiddleware,
    adminMiddleware,
    createProduct
);

router.patch(
    "/:id",
    authMiddleware,
    adminMiddleware,
    updateProduct
);

router.delete(
    "/:id",
    authMiddleware,
    adminMiddleware,
    deleteProduct
);

export default router;