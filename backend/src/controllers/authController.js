import pool from "../db/database.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Kiểm tra dữ liệu
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ thông tin"
            });
        }

        // 2. Kiểm tra email đã tồn tại chưa
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({
                message: "Email đã được sử dụng"
            });
        }

        // 3. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Lưu user vào database
        const result = await pool.query(
            `INSERT INTO users (name, email, password)
             VALUES ($1, $2, $3)
             RETURNING id, name, email, created_at`,
            [name, email, hashedPassword]
        );

        // 5. Trả user về frontend
        res.status(201).json({
            message: "Đăng ký thành công",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Kiểm tra dữ liệu
        if (!email || !password) {
            return res.status(400).json({
                message: "Vui lòng nhập email và password"
            });
        }

        // 2. Tìm user
        const result = await pool.query(
            "SELECT * FROM users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                message: "Email hoặc password không đúng"
            });
        }

        const user = result.rows[0];

        // 3. Kiểm tra password
        const isPasswordCorrect = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Email hoặc password không đúng"
            });
        }

        // 4. Tạo JWT
        const jwtSecret = process.env.JWT_SECRET || "phone_shop_secret_123456";
        const token = jwt.sign(
            {
                userId: user.id
            },
            jwtSecret,
            {
                expiresIn: "7d"
            }
        );

        // 5. Trả kết quả
        res.json({
            message: "Đăng nhập thành công",
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Lỗi server"
        });
    }
};

export const updateName = async (req, res) => {
    try {
        const userId = req.userId;
        const { name } = req.body;

        if (!name || name.trim() === "") {
            return res.status(400).json({
                message: "Tên không được để trống"
            });
        }

        const result = await pool.query(
            `UPDATE users
             SET name = $1
             WHERE id = $2
             RETURNING id, name, email, created_at`,
            [name.trim(), userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        res.json({
            message: "Đổi tên thành công",
            user: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể đổi tên"
        });
    }
};

export const updatePassword = async (req, res) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Vui lòng nhập đầy đủ mật khẩu"
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                message: "Mật khẩu mới phải có ít nhất 6 ký tự"
            });
        }

        const result = await pool.query(
            "SELECT password FROM users WHERE id = $1",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy người dùng"
            });
        }

        const user = result.rows[0];

        const isPasswordCorrect = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isPasswordCorrect) {
            return res.status(400).json({
                message: "Mật khẩu hiện tại không đúng"
            });
        }

        const hashedPassword = await bcrypt.hash(
            newPassword,
            10
        );

        await pool.query(
            `UPDATE users
             SET password = $1
             WHERE id = $2`,
            [hashedPassword, userId]
        );

        res.json({
            message: "Đổi mật khẩu thành công"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể đổi mật khẩu"
        });
    }
};

