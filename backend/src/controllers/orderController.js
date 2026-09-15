import pool from "../db/database.js";

// CREATE ORDER (Checkout)
export const createOrder = async (req, res) => {
    const client = await pool.connect();

    try {
        const userId = req.userId;
        const {
            customerName,
            customerPhone,
            customerAddress,
            paymentMethod = "COD",
            couponCode = null,
            note = ""
        } = req.body;

        if (!customerName || !customerPhone || !customerAddress) {
            return res.status(400).json({
                message: "Vui lòng điền đầy đủ họ tên, số điện thoại và địa chỉ giao hàng"
            });
        }

        // 1. Lấy giỏ hàng của user
        const cartResult = await client.query(
            "SELECT id FROM carts WHERE user_id = $1",
            [userId]
        );

        if (cartResult.rows.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng của bạn đang trống" });
        }

        const cartId = cartResult.rows[0].id;

        // 2. Lấy danh sách sản phẩm trong giỏ
        const itemsResult = await client.query(
            `SELECT 
                ci.product_id,
                ci.quantity,
                p.name,
                p.price,
                p.image,
                p.stock
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.cart_id = $1`,
            [cartId]
        );

        if (itemsResult.rows.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng của bạn đang trống" });
        }

        const items = itemsResult.rows;

        // 3. Kiểm tra số lượng tồn kho
        for (const item of items) {
            if (item.stock < item.quantity) {
                return res.status(400).json({
                    message: `Sản phẩm "${item.name}" chỉ còn ${item.stock} chiếc trong kho, không đủ đáp ứng số lượng bạn đặt (${item.quantity})`
                });
            }
        }

        // 4. Tính tổng tiền hàng
        const subtotal = items.reduce(
            (sum, item) => sum + Number(item.price) * item.quantity,
            0
        );

        let discountAmount = 0;
        let appliedCouponCode = null;

        // 5. Kiểm tra và áp dụng mã giảm giá nếu có
        if (couponCode && couponCode.trim() !== "") {
            const formattedCode = couponCode.trim().toUpperCase();
            const couponRes = await client.query(
                "SELECT * FROM coupons WHERE code = $1",
                [formattedCode]
            );

            if (couponRes.rows.length > 0) {
                const coupon = couponRes.rows[0];
                const isValid =
                    coupon.is_active &&
                    (!coupon.expires_at || new Date(coupon.expires_at) >= new Date()) &&
                    (!coupon.usage_limit || coupon.used_count < coupon.usage_limit) &&
                    subtotal >= Number(coupon.min_order_value);

                if (isValid) {
                    appliedCouponCode = coupon.code;
                    if (coupon.discount_type === "percentage") {
                        discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
                        if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
                            discountAmount = Number(coupon.max_discount_amount);
                        }
                    } else if (coupon.discount_type === "fixed_amount") {
                        discountAmount = Number(coupon.discount_value);
                    }
                    if (discountAmount > subtotal) {
                        discountAmount = subtotal;
                    }
                }
            }
        }

        const totalPrice = Math.max(0, subtotal - discountAmount);

        // ============================================
        // TRANSACTION BẮT ĐẦU
        // ============================================
        await client.query("BEGIN");

        // A. Tạo đơn hàng
        const orderResult = await client.query(
            `INSERT INTO orders 
             (user_id, customer_name, customer_phone, customer_address, payment_method, coupon_code, discount_amount, total_price, status, note)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             RETURNING *`,
            [
                userId,
                customerName.trim(),
                customerPhone.trim(),
                customerAddress.trim(),
                paymentMethod,
                appliedCouponCode,
                discountAmount,
                totalPrice,
                "pending",
                note ? note.trim() : ""
            ]
        );

        const order = orderResult.rows[0];

        // B. Lưu từng món hàng và trừ tồn kho
        for (const item of items) {
            await client.query(
                `INSERT INTO order_items 
                 (order_id, product_id, product_name, product_image, price, quantity)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [
                    order.id,
                    item.product_id,
                    item.name,
                    item.image,
                    item.price,
                    item.quantity
                ]
            );

            await client.query(
                `UPDATE products 
                 SET stock = stock - $1 
                 WHERE id = $2`,
                [item.quantity, item.product_id]
            );
        }

        // C. Tăng số lượt dùng coupon nếu có áp dụng
        if (appliedCouponCode) {
            await client.query(
                `UPDATE coupons 
                 SET used_count = used_count + 1 
                 WHERE code = $1`,
                [appliedCouponCode]
            );
        }

        // D. Dọn sạch giỏ hàng
        await client.query(
            "DELETE FROM cart_items WHERE cart_id = $1",
            [cartId]
        );

        await client.query("COMMIT");
        // ============================================
        // TRANSACTION HOÀN TẤT
        // ============================================

        res.status(201).json({
            message: "Đặt hàng thành công",
            order: {
                id: order.id,
                total_price: order.total_price,
                discount_amount: order.discount_amount,
                coupon_code: order.coupon_code,
                payment_method: order.payment_method,
                status: order.status,
                created_at: order.created_at
            }
        });

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Lỗi createOrder:", error);
        res.status(500).json({ message: "Không thể xử lý đặt hàng. Vui lòng thử lại" });
    } finally {
        client.release();
    }
};

// GET MY ORDERS (Khách xem lịch sử)
export const getMyOrders = async (req, res) => {
    try {
        const userId = req.userId;

        const result = await pool.query(
            `SELECT * FROM orders 
             WHERE user_id = $1 
             ORDER BY id DESC`,
            [userId]
        );

        res.json(result.rows);
    } catch (error) {
        console.error("Lỗi getMyOrders:", error);
        res.status(500).json({ message: "Không thể lấy danh sách đơn hàng" });
    }
};

// GET ALL ORDERS (Admin)
export const getAllOrders = async (req, res) => {
    try {
        const { status } = req.query;

        let query = `
            SELECT 
                orders.*,
                users.name as user_name,
                users.email as user_email
            FROM orders
            JOIN users ON orders.user_id = users.id
        `;
        const params = [];

        if (status && status !== "ALL") {
            params.push(status);
            query += ` WHERE orders.status = $${params.length}`;
        }

        query += " ORDER BY orders.id DESC";

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error("Lỗi getAllOrders:", error);
        res.status(500).json({ message: "Không thể lấy danh sách đơn hàng" });
    }
};

// UPDATE ORDER STATUS (Admin)
export const updateOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "processing", "shipping", "completed", "cancelled"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Trạng thái đơn hàng không hợp lệ" });
        }

        const result = await pool.query(
            `UPDATE orders 
             SET status = $1 
             WHERE id = $2 
             RETURNING *`,
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        res.json({
            message: "Cập nhật trạng thái đơn hàng thành công",
            order: result.rows[0]
        });
    } catch (error) {
        console.error("Lỗi updateOrderStatus:", error);
        res.status(500).json({ message: "Không thể cập nhật trạng thái đơn hàng" });
    }
};

// GET ORDER BY ID (Chi tiết đơn hàng - User xem đơn của mình, Admin xem bất kỳ đơn nào)
export const getOrderById = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        // Kiểm tra xem người gọi có phải là admin không
        const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
        const isAdmin = userRes.rows.length > 0 && userRes.rows[0].role === "admin";

        let orderResult;
        if (isAdmin) {
            orderResult = await pool.query("SELECT * FROM orders WHERE id = $1", [id]);
        } else {
            orderResult = await pool.query(
                "SELECT * FROM orders WHERE id = $1 AND user_id = $2",
                [id, userId]
            );
        }

        if (orderResult.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const order = orderResult.rows[0];

        const itemsResult = await pool.query(
            "SELECT * FROM order_items WHERE order_id = $1 ORDER BY id ASC",
            [id]
        );

        res.json({
            order,
            items: itemsResult.rows
        });

    } catch (error) {
        console.error("Lỗi getOrderById:", error);
        res.status(500).json({ message: "Không thể lấy chi tiết đơn hàng" });
    }
};
