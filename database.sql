-- Database: affiliate_shop
-- Created for Affiliate Shop Management System

-- Create database
CREATE DATABASE IF NOT EXISTS affiliate_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE affiliate_shop;

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    image VARCHAR(500),
    original_price DECIMAL(10,2) NOT NULL,
    sale_price DECIMAL(10,2) NOT NULL,
    affiliate_link TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_prices (original_price, sale_price),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Product tracking table (for analytics)
CREATE TABLE IF NOT EXISTS product_tracking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'click', 'view', etc.
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample products
INSERT INTO products (name, description, image, original_price, sale_price, affiliate_link) VALUES
('Máy sấy tóc mini', 'Máy sấy tóc mini công suất lớn, gọn nhẹ dễ mang theo', 'uploads/dryer1.jpg', 78000.00, 58998.00, 'https://shopee.vn/product/123456'),
('Mũ bảo hiểm fullface', 'Mũ bảo hiểm fullface chính hãng, đạt chuẩn an toàn', 'uploads/helmet1.jpg', 60000.00, 49000.00, 'https://shopee.vn/product/234567'),
('Ốp lưng điện thoại', 'Ốp lưng silicon cao cấp, chống sốc, bảo vệ camera', 'uploads/phonecase1.jpg', 35000.00, 25542.00, 'https://shopee.vn/product/345678'),
('Tai nghe không dây', 'Tai nghe Bluetooth 5.0, chất âm tuyệt vời, pin trâu', 'uploads/earbuds1.jpg', 450000.00, 289000.00, 'https://shopee.vn/product/456789'),
('Sạc dự phòng 20000mAh', 'Sạc dự phòng dung lượng lớn, hỗ trợ sạc nhanh', 'uploads/powerbank1.jpg', 320000.00, 189000.00, 'https://shopee.vn/product/567890'),
('Loa Bluetooth di động', 'Loa Bluetooth bass mạnh, chống nước IPX7', 'uploads/speaker1.jpg', 680000.00, 459000.00, 'https://shopee.vn/product/678901'),
('Bàn phím cơ gaming', 'Bàn phím cơ RGB, switch blue, phù hợp game thủ', 'uploads/keyboard1.jpg', 890000.00, 659000.00, 'https://shopee.vn/product/789012'),
('Chuột gaming wireless', 'Chuột không dây DPI cao, pin lâu, thiết kế ergonomics', 'uploads/mouse1.jpg', 450000.00, 329000.00, 'https://shopee.vn/product/890123'),
('Webcam HD 1080p', 'Webcard chất lượng cao, phù hợp họp online, livestream', 'uploads/webcam1.jpg', 780000.00, 549000.00, 'https://shopee.vn/product/901234'),
('Microphone USB', 'Microphone thu âm chuyên nghiệp, giảm ồn tốt', 'uploads/mic1.jpg', 1200000.00, 890000.00, 'https://shopee.vn/product/012345');

-- Insert sample tracking data
INSERT INTO product_tracking (product_id, action, ip_address, user_agent) VALUES
(1, 'click', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'),
(2, 'click', '192.168.1.101', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'),
(1, 'click', '192.168.1.102', 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_7_1 like Mac OS X)'),
(3, 'click', '192.168.1.103', 'Mozilla/5.0 (Android 11; Mobile; rv:68.0) Gecko/68.0 Firefox/88.0'),
(2, 'click', '192.168.1.104', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

-- Create view for product statistics
CREATE VIEW product_stats AS
SELECT 
    p.id,
    p.name,
    p.original_price,
    p.sale_price,
    p.created_at,
    COUNT(pt.id) as total_clicks,
    COUNT(CASE WHEN pt.action = 'click' THEN 1 END) as click_count,
    COUNT(CASE WHEN pt.action = 'view' THEN 1 END) as view_count,
    ROUND((p.original_price - p.sale_price) / p.original_price * 100, 2) as discount_percentage
FROM products p
LEFT JOIN product_tracking pt ON p.id = pt.product_id
GROUP BY p.id, p.name, p.original_price, p.sale_price, p.created_at;

-- Create indexes for better performance
CREATE INDEX idx_product_search ON products(name, description);
CREATE INDEX idx_price_range ON products(sale_price, original_price);
CREATE INDEX idx_discount_calc ON products((original_price - sale_price));

-- Create trigger for tracking product views (optional)
DELIMITER //
CREATE TRIGGER after_product_insert
AFTER INSERT ON products
FOR EACH ROW
BEGIN
    -- Log when a new product is added
    INSERT INTO product_tracking (product_id, action, ip_address, user_agent)
    VALUES (NEW.id, 'created', '127.0.0.1', 'System');
END//
DELIMITER ;

-- Set default character set
ALTER DATABASE affiliate_shop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;