# Shop Affiliate - Hệ thống bán hàng tiếp thị liên kết

Một hệ thống bán hàng tiếp thị liên kết đơn giản được xây dựng với HTML, CSS, JavaScript và PHP.

## Tính năng

### Client (Khách hàng)
- 📱 Responsive design - Tương thích mọi thiết bị
- 🔍 Tìm kiếm sản phẩm theo tên
- 🏷️ Lọc sản phẩm theo danh mục (Tất cả, Flash Sale, Giảm giá, Mới nhất)
- 📊 Sắp xếp sản phẩm (Giá, Giảm giá, Mới nhất)
- 🛒 Click trực tiếp đến link affiliate
- 🎨 Giao diện hiện đại với Tailwind CSS

### Admin (Quản trị)
- 🔐 Đăng nhập admin bảo mật
- ➕ Thêm sản phẩm mới
- ✏️ Chỉnh sửa thông tin sản phẩm
- 🗑️ Xóa sản phẩm
- 📤 Upload hình ảnh sản phẩm
- 📈 Quản lý danh sách sản phẩm
- 🖼️ Xem trước hình ảnh

## Cấu trúc thư mục

```
shop-affiliate/
├── index.html              # Trang chủ client
├── style.css              # CSS tùy chỉnh
├── script.js              # JavaScript client
├── config.php             # Cấu hình database
├── database.sql           # File SQL tạo database
├── admin/
│   └── index.php          # Trang quản trị admin
├── api/
│   ├── products.php       # API lấy sản phẩm
│   └── track.php          # API tracking click
├── uploads/               # Thư mục upload hình ảnh
└── README.md              # File hướng dẫn
```

## Cài đặt

### 1. Yêu cầu
- PHP 7.4+ 
- MySQL/MariaDB
- Web server (Apache/Nginx)
- Extension PHP: mysqli, gd

### 2. Tạo database
```sql
-- Import file database.sql vào MySQL của bạn
mysql -u root -p affiliate_shop < database.sql
```

### 3. Cấu hình database
Mở file `config.php` và chỉnh sửa thông tin kết nối:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'your_password');
define('DB_NAME', 'affiliate_shop');
```

### 4. Cấu hình quyền
```bash
# Đảm bảo thư mục uploads có quyền ghi
chmod 777 uploads/
```

### 5. Truy cập
- **Client**: `http://localhost/shop-affiliate/`
- **Admin**: `http://localhost/shop-affiliate/admin/`
  - Mật khẩu mặc định: `admin123`

## Sản phẩm

Mỗi sản phẩm bao gồm:
- **Tên sản phẩm**: Tên hiển thị cho khách hàng
- **Hình ảnh**: Ảnh sản phẩm (JPG, PNG, GIF, WebP - tối đa 5MB)
- **Giá gốc**: Giá gốc của sản phẩm
- **Giá giảm**: Giá sau khi giảm
- **Link Affiliate**: Link chuyển hướng khi khách hàng click mua

## API Endpoints

### GET /api/products.php
Lấy danh sách sản phẩm

Parameters:
- `search` (string): Tìm kiếm theo tên
- `category` (string): Lọc theo danh mục (flashsale, discount)
- `sort` (string): Sắp xếp (newest, price-low, price-high, discount)
- `limit` (int): Giới hạn kết quả (mặc định: 50)
- `offset` (int): Bắt đầu từ (mặc định: 0)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Tên sản phẩm",
      "description": "Mô tả",
      "image": "uploads/product.jpg",
      "original_price": 100000,
      "sale_price": 80000,
      "affiliate_link": "https://example.com/product",
      "discount_percentage": 20,
      "created_at": "2024-01-01 00:00:00"
    }
  ],
  "pagination": {
    "total": 10,
    "limit": 50,
    "offset": 0,
    "has_more": false
  }
}
```

### POST /api/track.php
Tracking hành vi người dùng

Body:
```json
{
  "product_id": 1,
  "action": "click"
}
```

## Bảo mật

- ✅ SQL Injection Prevention với Prepared Statements
- ✅ XSS Prevention với htmlspecialchars()
- ✅ CSRF Protection
- ✅ File Upload Validation
- ✅ Input Sanitization
- ✅ Security Headers

## Tùy chỉnh

### Thay đổi mật khẩu admin
Mở file `admin/index.php` và thay đổi:
```php
$admin_password = 'your_new_password';
```

### Tùy chỉnh giao diện
- Chỉnh sửa `style.css` cho CSS tùy chỉnh
- Sử dụng Tailwind CSS classes trong HTML
- Thay đổi màu sắc chủ đề trong file CSS

### Thêm tính năng
- Tạo API endpoint mới trong thư mục `api/`
- Thêm JavaScript functions trong `script.js`
- Mở rộng database schema trong `database.sql`

## Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra log lỗi PHP
2. Đảm bảo quyền thư mục uploads
3. Kiểm tra kết nối database
4. Xem lại cấu hình web server

## License

MIT License - Có thể sử dụng cho mục đích thương mại