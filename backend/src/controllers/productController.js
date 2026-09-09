import pool from "../db/database.js";

//GET
export const getProducts = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM products ORDER BY id ASC"
        );

        res.json(result.rows);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể lấy danh sách sản phẩm"
        });
    }
};

//GET by ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "SELECT * FROM products WHERE id = $1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể lấy sản phẩm"
        });
    }
};

//POST
export const createProduct = async (req, res) => {
    try {
        const {
            name,
            brand,
            price,
            description,
            image,
            stock
        } = req.body;

        const result = await pool.query(
            `INSERT INTO products
            (name, brand, price, description, image, stock)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *`,
            [
                name,
                brand,
                price,
                description,
                image,
                stock
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể tạo sản phẩm"
        });
    }
};

// PATCH
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const {
            name,
            brand,
            price,
            description,
            image,
            stock
        } = req.body;

        const result = await pool.query(
            `UPDATE products
             SET name = $1,
                 brand = $2,
                 price = $3,
                 description = $4,
                 image = $5,
                 stock = $6
             WHERE id = $7
             RETURNING *`,
            [
                name,
                brand,
                price,
                description,
                image,
                stock,
                id
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json(result.rows[0]);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể cập nhật sản phẩm"
        });
    }
};


// DELETE
export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM products
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Không tìm thấy sản phẩm"
            });
        }

        res.json({
            message: "Xóa sản phẩm thành công",
            product: result.rows[0]
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Không thể xóa sản phẩm"
        });
    }
};