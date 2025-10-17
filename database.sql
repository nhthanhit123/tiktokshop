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

-- Insert sample products with realistic data
INSERT INTO products (name, description, image, original_price, sale_price, affiliate_link) VALUES
('Máy sấy tóc mini công suất lớn 1800W', 'Máy sấy tóc mini công suất lớn, gọn nhẹ dễ mang theo, 2 tốc độ, làm nóng nhanh', 'uploads/dryer1.jpg', 289000.00, 189000.00, 'https://shopee.vn/product/123456'),
('Mũ bảo hiểm fullface 3/4 chính hãng', 'Mũ bảo hiểm fullface chính hãng, đạt chuẩn an toàn quốc tế, kính chống trầy', 'uploads/helmet1.jpg', 450000.00, 289000.00, 'https://shopee.vn/product/234567'),
('Ốp lưng điện thoại iPhone 13 Pro Max', 'Ốp lưng silicon cao cấp, chống sốc, bảo vệ camera, trong suốt viền màu', 'uploads/phonecase1.jpg', 125000.00, 69000.00, 'https://shopee.vn/product/345678'),
('Tai nghe Bluetooth AirPods Pro replica', 'Tai nghe Bluetooth 5.0, chất âm tuyệt vời, pin trâu, chống ồn chủ động', 'uploads/earbuds1.jpg', 1290000.00, 890000.00, 'https://shopee.vn/product/456789'),
('Sạc dự phòng Anker 20000mAh PowerCore', 'Sạc dự phòng dung lượng lớn, hỗ trợ sạc nhanh PowerIQ, 2 cổng USB', 'uploads/powerbank1.jpg', 890000.00, 650000.00, 'https://shopee.vn/product/567890'),
('Loa Bluetooth JBL Flip 5', 'Loa Bluetooth bass mạnh, chống nước IPX7, pin 12 giờ, thiết kế nhỏ gọn', 'uploads/speaker1.jpg', 2390000.00, 1590000.00, 'https://shopee.vn/product/678901'),
('Bàn phím cơ gaming RGB Mechanical', 'Bàn phím cơ RGB backlight, switch blue, phù hợp game thủ, anti-ghosting', 'uploads/keyboard1.jpg', 1890000.00, 1290000.00, 'https://shopee.vn/product/789012'),
('Chuột gaming wireless Logitech G304', 'Chuột không dây DPI cao 12000, pin lâu 250 giờ, thiết kế ergonomics', 'uploads/mouse1.jpg', 1190000.00, 890000.00, 'https://shopee.vn/product/890123'),
('Webcam HD 1080p Logitech C920', 'Webcam chất lượng cao, phù hợp họp online, livestream, micro tích hợp', 'uploads/webcam1.jpg', 2390000.00, 1590000.00, 'https://shopee.vn/product/901234'),
('Microphone USB Rode NT-USB', 'Microphone thu âm chuyên nghiệp, giảm ồn tốt, phù hợp podcast/streaming', 'uploads/mic1.jpg', 4590000.00, 3290000.00, 'https://shopee.vn/product/012345'),
('Đồng hồ thông minh Apple Watch Series 8', 'Đồng hồ thông minh theo dõi sức khỏe, GPS, chống nước, pin 18 giờ', 'uploads/watch1.jpg', 12990000.00, 10990000.00, 'https://shopee.vn/product/111111'),
('Tai nghe over-ear Sony WH-1000XM4', 'Tai nghe chụp tai chống ồn chủ động, chất âm hi-res, pin 30 giờ', 'uploads/headphone1.jpg', 6990000.00, 4990000.00, 'https://shopee.vn/product/222222'),
('Máy ảnh Canon EOS M50 Mark II', 'Máy ảnh mirrorless 24.1MP, 4K video, màn hình xoay lật, wifi', 'uploads/camera1.jpg', 18900000.00, 15900000.00, 'https://shopee.vn/product/333333'),
('Gaming Laptop ASUS ROG Strix G15', 'Laptop gaming RTX 3060, AMD Ryzen 7, RAM 16GB, SSD 512GB, 144Hz', 'uploads/laptop1.jpg', 28990000.00, 24990000.00, 'https://shopee.vn/product/444444'),
('iPad Air 5 2022 WiFi 64GB', 'iPad Air M1 chip, 10.9 inch Liquid Retina, hỗ trợ Apple Pencil 2', 'uploads/ipad1.jpg', 14990000.00, 13990000.00, 'https://shopee.vn/product/555555');

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