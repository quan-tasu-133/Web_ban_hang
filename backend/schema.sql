-- Database: task_manager (hoặc phone_shop)

-- 1. Bảng USERS
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng PRODUCTS
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    price NUMERIC(15, 2) NOT NULL,
    description TEXT,
    image TEXT,
    stock INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bảng CARTS
CREATE TABLE IF NOT EXISTS carts (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng CART_ITEMS
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_cart_product UNIQUE(cart_id, product_id)
);

-- 5. Bảng COUPONS (Mã giảm giá)
CREATE TABLE IF NOT EXISTS coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL, -- 'percentage' hoặc 'fixed_amount'
    discount_value NUMERIC(15, 2) NOT NULL,
    min_order_value NUMERIC(15, 2) DEFAULT 0,
    max_discount_amount NUMERIC(15, 2),
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Bảng ORDERS (Đơn hàng)
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(50) NOT NULL,
    customer_address TEXT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'COD',
    coupon_code VARCHAR(50),
    discount_amount NUMERIC(15, 2) DEFAULT 0,
    total_price NUMERIC(15, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipping', 'completed', 'cancelled'
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Bảng ORDER_ITEMS (Chi tiết đơn hàng)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT,
    price NUMERIC(15, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- DỮ LIỆU MẪU (Mật khẩu: 123456)
INSERT INTO users (name, email, password, role)
VALUES 
    ('Admin User', 'admin@gmail.com', '$2a$10$7zD6z7iSgY37i5b8/6lE7.uK1uX8q9dY6k2Z6aYyW5S5/lE11Y44G', 'admin'),
    ('Khách hàng', 'user@gmail.com', '$2a$10$7zD6z7iSgY37i5b8/6lE7.uK1uX8q9dY6k2Z6aYyW5S5/lE11Y44G', 'user')
ON CONFLICT (email) DO NOTHING;

INSERT INTO products (name, brand, price, description, image, stock)
VALUES 
    ('iPhone 15 Pro Max 256GB', 'Apple', 29990000, 'Titan tự nhiên, chip A17 Pro mạnh mẽ, camera 48MP zoom quang 5x đỉnh cao.', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80', 25),
    ('Samsung Galaxy S24 Ultra 256GB', 'Samsung', 27490000, 'Galaxy AI thông minh, khung viền Titanium, bút S-Pen tích hợp.', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80', 18),
    ('Xiaomi 14 Ultra 512GB', 'Xiaomi', 24990000, 'Ống kính quang học Leica huyền thoại, cảm biến 1 inch, Snapdragon 8 Gen 3.', 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&auto=format&fit=crop&q=80', 12)
ON CONFLICT DO NOTHING;

INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_discount_amount)
VALUES 
    ('GIAM100K', 'fixed_amount', 100000, 500000, NULL),
    ('SALE10', 'percentage', 10, 0, 500000)
ON CONFLICT (code) DO NOTHING;
