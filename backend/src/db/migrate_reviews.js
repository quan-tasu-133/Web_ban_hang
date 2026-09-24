import pool from "./database.js";

async function seed() {
    try {
        await pool.query(`
            INSERT INTO reviews (product_id, user_id, rating, comment)
            VALUES 
                (1, 1, 5, 'Máy đẹp xuất sắc, chụp ảnh zoom 5x cực nét, cầm đầm tay và pin rất trâu!'),
                (1, 2, 5, 'Giao hàng nhanh, đóng gói cẩn thận. Màu sắc rất sang trọng.'),
                (3, 1, 5, 'Hiệu năng Snapdragon cực mạnh, màn hình 120Hz siêu mượt.')
            ON CONFLICT (product_id, user_id) DO NOTHING;
        `);
        console.log("Seeded reviews successfully!");
    } catch(err) {
        console.error("Seed error:", err);
    } finally {
        await pool.end();
    }
}
seed();
