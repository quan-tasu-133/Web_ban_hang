import pool from "../db/database.js";

// GET ALL or SEARCH/FILTER
export const getProducts = async (req, res) => {
    try {
        const { search, brand, sort } = req.query;

        let query = "SELECT * FROM products WHERE 1=1";
        const params = [];

        // 1. Tìm kiếm theo từ khóa (tên, hãng, mô tả)
        if (search && search.trim() !== "") {
            params.push(`%${search.trim()}%`);
            query += ` AND (name ILIKE $${params.length} OR brand ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }

        // 2. Lọc theo hãng
        if (brand && brand.trim() !== "") {
            params.push(brand.trim());
            query += ` AND brand ILIKE $${params.length}`;
        }

        // 3. Sắp xếp
        if (sort === "price_asc") {
            query += " ORDER BY price ASC";
        } else if (sort === "price_desc") {
            query += " ORDER BY price DESC";
        } else if (sort === "newest") {
            query += " ORDER BY id DESC";
        } else {
            query += " ORDER BY id ASC";
        }

        const result = await pool.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error("Lỗi getProducts:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách sản phẩm"
        });
    }
};

// GET DISTINCT BRANDS
export const getBrands = async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND TRIM(brand) != '' ORDER BY brand ASC"
        );

        const brands = result.rows.map(row => row.brand);
        res.json(brands);
    } catch (error) {
        console.error("Lỗi getBrands:", error);

        res.status(500).json({
            message: "Không thể lấy danh sách thương hiệu"
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