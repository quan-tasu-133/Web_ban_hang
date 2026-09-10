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