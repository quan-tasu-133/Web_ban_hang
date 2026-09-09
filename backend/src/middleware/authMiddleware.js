import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        // 1. Lấy Authorization header
        const authHeader = req.headers.authorization;

        // 2. Không có token
        if (!authHeader) {
            return res.status(401).json({
                message: "Bạn chưa đăng nhập"
            });
        }

        // 3. Lấy token
        const token = authHeader.split(" ")[1];

        // 4. Kiểm tra token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // 5. Lưu userId vào request
        req.userId = decoded.userId;

        // 6. Cho phép đi tiếp
        next();

    } catch (error) {
        return res.status(401).json({
            message: "Token không hợp lệ hoặc đã hết hạn"
        });
    }
};