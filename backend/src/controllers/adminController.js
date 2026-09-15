import pool from "../db/database.js";

// GET ALL USERS (Admin)
export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT 
                u.id, 
                u.name, 
                u.email, 
                u.role, 
                u.created_at,
                COUNT(o.id) AS total_orders
            FROM users u
            LEFT JOIN orders o ON u.id = o.user_id
            GROUP BY u.id
            ORDER BY u.id ASC
        `);

        res.json(result.rows);
    } catch (error) {
        console.error("Lỗi getAllUsers:", error);
        res.status(500).json({ message: "Không thể lấy danh sách người dùng" });
    }
};

// UPDATE USER ROLE (Admin)
export const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!role || !["user", "admin"].includes(role)) {
            return res.status(400).json({ message: "Vai trò không hợp lệ (chỉ chấp nhận 'user' hoặc 'admin')" });
        }

        // Không cho phép tự đổi vai trò của chính mình để tránh mất quyền quản trị
        if (Number(id) === req.userId) {
            return res.status(400).json({ message: "Bạn không thể tự thay đổi vai trò của chính mình" });
        }

        const result = await pool.query(
            "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role, created_at",
            [role, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.json({
            message: "Cập nhật vai trò thành công",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Lỗi updateUserRole:", error);
        res.status(500).json({ message: "Không thể cập nhật vai trò người dùng" });
    }
};

// DELETE USER (Admin)
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Không cho phép tự xóa tài khoản của chính mình
        if (Number(id) === req.userId) {
            return res.status(400).json({ message: "Bạn không thể tự xóa tài khoản của chính mình" });
        }

        const result = await pool.query(
            "DELETE FROM users WHERE id = $1 RETURNING id, name, email, role",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }

        res.json({
            message: "Đã xóa tài khoản người dùng thành công",
            user: result.rows[0]
        });

    } catch (error) {
        console.error("Lỗi deleteUser:", error);
        res.status(500).json({ message: "Không thể xóa tài khoản người dùng" });
    }
};
