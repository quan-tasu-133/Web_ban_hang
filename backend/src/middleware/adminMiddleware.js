import pool from "../db/database.js";

export const adminMiddleware = async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT role FROM users WHERE id = $1",
            [req.userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        if (result.rows[0].role !== "admin") {
            return res.status(403).json({
                message: "Bạn không có quyền Admin"
            });
        }

        next();

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể kiểm tra quyền Admin"
        });
    }
};