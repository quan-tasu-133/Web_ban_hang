import pool from "../db/database.js";

// GET ALL COUPONS (Admin)
export const getCoupons = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM coupons ORDER BY id DESC"
        );
        res.json(result.rows);
    } catch (error) {
        console.error("Lỗi getCoupons:", error);
        res.status(500).json({ message: "Không thể lấy danh sách mã giảm giá" });
    }
};

// CREATE COUPON (Admin)
export const createCoupon = async (req, res) => {
    try {
        const {
            code,
            discount_type,
            discount_value,
            min_order_value = 0,
            max_discount_amount = null,
            usage_limit = null,
            expires_at = null
        } = req.body;

        if (!code || !discount_type || !discount_value) {
            return res.status(400).json({ message: "Vui lòng nhập đầy đủ thông tin mã giảm giá" });
        }

        if (!["percentage", "fixed_amount"].includes(discount_type)) {
            return res.status(400).json({ message: "Loại giảm giá không hợp lệ" });
        }

        if (discount_type === "percentage" && (Number(discount_value) <= 0 || Number(discount_value) > 100)) {
            return res.status(400).json({ message: "Tỷ lệ phần trăm giảm giá phải từ 1 đến 100" });
        }

        const formattedCode = code.trim().toUpperCase();

        const existing = await pool.query("SELECT id FROM coupons WHERE code = $1", [formattedCode]);
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Mã giảm giá này đã tồn tại" });
        }

        const result = await pool.query(
            `INSERT INTO coupons 
             (code, discount_type, discount_value, min_order_value, max_discount_amount, usage_limit, expires_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING *`,
            [
                formattedCode,
                discount_type,
                Number(discount_value),
                Number(min_order_value) || 0,
                max_discount_amount ? Number(max_discount_amount) : null,
                usage_limit ? Number(usage_limit) : null,
                expires_at || null
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Lỗi createCoupon:", error);
        res.status(500).json({ message: "Không thể tạo mã giảm giá" });
    }
};

// TOGGLE STATUS (Admin)
export const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "UPDATE coupons SET is_active = NOT is_active WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Lỗi toggleCouponStatus:", error);
        res.status(500).json({ message: "Không thể đổi trạng thái mã" });
    }
};

// DELETE COUPON (Admin)
export const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            "DELETE FROM coupons WHERE id = $1 RETURNING *",
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy mã giảm giá" });
        }
        res.json({ message: "Đã xóa mã giảm giá", coupon: result.rows[0] });
    } catch (error) {
        console.error("Lỗi deleteCoupon:", error);
        res.status(500).json({ message: "Không thể xóa mã giảm giá" });
    }
};

// APPLY COUPON (Khách hàng áp dụng khi Checkout)
export const applyCoupon = async (req, res) => {
    try {
        const { code, orderTotal } = req.body;

        if (!code || orderTotal === undefined) {
            return res.status(400).json({ message: "Thiếu thông tin mã hoặc tổng tiền đơn hàng" });
        }

        const formattedCode = code.trim().toUpperCase();

        const result = await pool.query(
            "SELECT * FROM coupons WHERE code = $1",
            [formattedCode]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Mã giảm giá không tồn tại" });
        }

        const coupon = result.rows[0];

        // 1. Kiểm tra kích hoạt
        if (!coupon.is_active) {
            return res.status(400).json({ message: "Mã giảm giá hiện đang bị vô hiệu hóa" });
        }

        // 2. Kiểm tra hạn sử dụng
        if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
            return res.status(400).json({ message: "Mã giảm giá đã hết hạn sử dụng" });
        }

        // 3. Kiểm tra số lượt dùng
        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
            return res.status(400).json({ message: "Mã giảm giá đã hết lượt sử dụng" });
        }

        // 4. Kiểm tra giá trị đơn hàng tối thiểu
        const subtotal = Number(orderTotal);
        if (subtotal < Number(coupon.min_order_value)) {
            return res.status(400).json({
                message: `Đơn hàng phải đạt tối thiểu ${Number(coupon.min_order_value).toLocaleString("vi-VN")} VNĐ để áp dụng mã này`
            });
        }

        // 5. Tính số tiền giảm giá
        let discountAmount = 0;
        if (coupon.discount_type === "percentage") {
            discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
            if (coupon.max_discount_amount && discountAmount > Number(coupon.max_discount_amount)) {
                discountAmount = Number(coupon.max_discount_amount);
            }
        } else if (coupon.discount_type === "fixed_amount") {
            discountAmount = Number(coupon.discount_value);
            if (discountAmount > subtotal) {
                discountAmount = subtotal;
            }
        }

        const finalTotal = Math.max(0, subtotal - discountAmount);

        res.json({
            message: "Áp dụng mã giảm giá thành công",
            coupon: {
                id: coupon.id,
                code: coupon.code,
                discount_type: coupon.discount_type,
                discount_value: coupon.discount_value,
                discountAmount,
                finalTotal
            }
        });

    } catch (error) {
        console.error("Lỗi applyCoupon:", error);
        res.status(500).json({ message: "Không thể áp dụng mã giảm giá" });
    }
};
