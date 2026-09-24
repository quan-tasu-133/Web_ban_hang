import pool from "../db/database.js";

// GET REVIEWS CHO 1 SẢN PHẨM
export const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        // 1. Lấy danh sách đánh giá kèm tên người dùng
        const result = await pool.query(
            `SELECT 
                r.id,
                r.product_id,
                r.user_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS user_name,
                u.email AS user_email
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.product_id = $1
             ORDER BY r.created_at DESC`,
            [productId]
        );

        // 2. Tính điểm trung bình và số lượng
        const stats = await pool.query(
            `SELECT 
                ROUND(AVG(rating)::numeric, 1) AS avg_rating,
                COUNT(id) AS total_reviews
             FROM reviews
             WHERE product_id = $1`,
            [productId]
        );

        res.json({
            avg_rating: stats.rows[0].avg_rating ? Number(stats.rows[0].avg_rating) : 0,
            total_reviews: Number(stats.rows[0].total_reviews || 0),
            reviews: result.rows
        });

    } catch (error) {
        console.error("Lỗi getProductReviews:", error);
        res.status(500).json({ message: "Không thể lấy danh sách đánh giá" });
    }
};

// TẠO HOẶC CẬP NHẬT ĐÁNH GIÁ (Khách hàng)
export const addOrUpdateReview = async (req, res) => {
    try {
        const { productId } = req.params;
        const { rating, comment } = req.body;
        const userId = req.userId;

        if (!rating || Number(rating) < 1 || Number(rating) > 5) {
            return res.status(400).json({ message: "Số sao đánh giá phải từ 1 đến 5" });
        }

        if (!comment || comment.trim() === "") {
            return res.status(400).json({ message: "Vui lòng nhập nội dung đánh giá" });
        }

        const result = await pool.query(
            `INSERT INTO reviews (product_id, user_id, rating, comment, created_at)
             VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
             ON CONFLICT (product_id, user_id) 
             DO UPDATE SET 
                rating = EXCLUDED.rating,
                comment = EXCLUDED.comment,
                created_at = CURRENT_TIMESTAMP
             RETURNING *`,
            [productId, userId, Number(rating), comment.trim()]
        );

        // Lấy lại review kèm tên user
        const fullReview = await pool.query(
            `SELECT 
                r.id,
                r.product_id,
                r.user_id,
                r.rating,
                r.comment,
                r.created_at,
                u.name AS user_name
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.id = $1`,
            [result.rows[0].id]
        );

        res.status(201).json({
            message: "Đánh giá sản phẩm thành công",
            review: fullReview.rows[0]
        });

    } catch (error) {
        console.error("Lỗi addOrUpdateReview:", error);
        res.status(500).json({ message: "Không thể gửi đánh giá" });
    }
};

// XÓA ĐÁNH GIÁ (Chính chủ hoặc Admin)
export const deleteReview = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Kiểm tra xem user có phải admin không
        const userRes = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
        const isAdmin = userRes.rows.length > 0 && userRes.rows[0].role === "admin";

        // Tìm review
        const reviewRes = await pool.query("SELECT * FROM reviews WHERE id = $1", [id]);
        if (reviewRes.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy đánh giá" });
        }

        const review = reviewRes.rows[0];

        if (review.user_id !== userId && !isAdmin) {
            return res.status(403).json({ message: "Bạn không có quyền xóa đánh giá này" });
        }

        await pool.query("DELETE FROM reviews WHERE id = $1", [id]);

        res.json({ message: "Đã xóa đánh giá thành công" });

    } catch (error) {
        console.error("Lỗi deleteReview:", error);
        res.status(500).json({ message: "Không thể xóa đánh giá" });
    }
};
