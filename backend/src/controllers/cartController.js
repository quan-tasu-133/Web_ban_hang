import pool from "../db/database.js";

export const getCart = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Tìm cart của user
        const cartResult = await pool.query(
            "SELECT * FROM carts WHERE user_id = $1",
            [userId]
        );

        // 2. Nếu user chưa có cart
        if (cartResult.rows.length === 0) {
            return res.json({
                items: []
            });
        }

        const cartId = cartResult.rows[0].id;

        // 3. Lấy sản phẩm trong cart
        const result = await pool.query(
            `SELECT
                cart_items.id,
                cart_items.product_id,
                cart_items.quantity,
                products.name,
                products.brand,
                products.price,
                products.image
             FROM cart_items
             JOIN products
                ON cart_items.product_id = products.id
             WHERE cart_items.cart_id = $1
             ORDER BY cart_items.id ASC`,
            [cartId]
        );

        res.json({
            cartId,
            items: result.rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể lấy giỏ hàng"
        });
    }
};

export const addToCart = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId, quantity = 1 } = req.body;

        // 1. Kiểm tra productId
        if (!productId) {
            return res.status(400).json({
                message: "Thiếu productId"
            });
        }

        // 2. Kiểm tra sản phẩm có tồn tại không
        const productResult = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [productId]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        // 3. Tìm cart của user
        let cartResult = await pool.query(
            "SELECT * FROM carts WHERE user_id = $1",
            [userId]
        );

        let cartId;

        // 4. Nếu chưa có cart → tạo cart
        if (cartResult.rows.length === 0) {
            const newCart = await pool.query(
                `INSERT INTO carts (user_id)
                 VALUES ($1)
                 RETURNING *`,
                [userId]
            );

            cartId = newCart.rows[0].id;
        } else {
            cartId = cartResult.rows[0].id;
        }

        // 5. Kiểm tra sản phẩm đã có trong cart chưa
        const existingItem = await pool.query(
            `SELECT * FROM cart_items
             WHERE cart_id = $1
             AND product_id = $2`,
            [cartId, productId]
        );

        // 6. Nếu đã có → tăng quantity
        if (existingItem.rows.length > 0) {
            const updatedItem = await pool.query(
                `UPDATE cart_items
                 SET quantity = quantity + $1
                 WHERE cart_id = $2
                 AND product_id = $3
                 RETURNING *`,
                [quantity, cartId, productId]
            );

            return res.json({
                message: "Đã tăng số lượng sản phẩm",
                item: updatedItem.rows[0]
            });
        }

        // 7. Nếu chưa có → thêm mới
        const newItem = await pool.query(
            `INSERT INTO cart_items
             (cart_id, product_id, quantity)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [cartId, productId, quantity]
        );

        res.status(201).json({
            message: "Thêm sản phẩm vào giỏ hàng thành công",
            item: newItem.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể thêm sản phẩm vào giỏ hàng"
        });
    }
};

export const updateCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;
        const { quantity } = req.body;

        // 1. Kiểm tra quantity
        if (!quantity || quantity < 1) {
            return res.status(400).json({
                message: "Số lượng phải lớn hơn 0"
            });
        }

        // 2. Tìm cart của user
        const cartResult = await pool.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                message: "Giỏ hàng không tồn tại"
            });
        }

        const cartId = cartResult.rows[0].id;

        // 3. Cập nhật sản phẩm
        const result = await pool.query(
            `UPDATE cart_items
             SET quantity = $1
             WHERE cart_id = $2
             AND product_id = $3
             RETURNING *`,
            [quantity, cartId, productId]
        );

        // 4. Không tìm thấy sản phẩm trong cart
        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Sản phẩm không có trong giỏ hàng"
            });
        }

        res.json({
            message: "Cập nhật số lượng thành công",
            item: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể cập nhật giỏ hàng"
        });
    }
};

export const deleteCartItem = async (req, res) => {
    try {
        const userId = req.userId;
        const { productId } = req.params;

        // Tìm giỏ hàng của user
        const cartResult = await pool.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                message: "Giỏ hàng không tồn tại"
            });
        }

        const cartId = cartResult.rows[0].id;

        // Xóa sản phẩm khỏi giỏ hàng
        const result = await pool.query(
            `DELETE FROM cart_items
             WHERE cart_id = $1
             AND product_id = $2
             RETURNING *`,
            [cartId, productId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Sản phẩm không có trong giỏ hàng"
            });
        }

        res.json({
            message: "Xóa sản phẩm khỏi giỏ hàng thành công",
            item: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể xóa sản phẩm khỏi giỏ hàng"
        });
    }
};

export const clearCart = async (req, res) => {
    try {
        const userId = req.userId;

        const cartResult = await pool.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cartResult.rows.length === 0) {
            return res.status(404).json({
                message: "Giỏ hàng không tồn tại"
            });
        }

        const cartId = cartResult.rows[0].id;

        await pool.query(
            "DELETE FROM cart_items WHERE cart_id = $1",
            [cartId]
        );

        res.json({
            message: "Đã xóa toàn bộ giỏ hàng"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể xóa giỏ hàng"
        });
    }
};