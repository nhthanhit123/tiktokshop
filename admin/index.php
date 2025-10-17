<?php
session_start();
require_once '../config.php';

// Simple authentication (in production, use proper authentication)
$admin_password = 'admin123'; // Change this in production

if (!isset($_SESSION['admin_logged_in'])) {
    if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['password'])) {
        if ($_POST['password'] === $admin_password) {
            $_SESSION['admin_logged_in'] = true;
            header('Location: index.php');
            exit;
        } else {
            $error = 'Mật khẩu không đúng';
        }
    }
    
    // Show login form
    ?>
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Admin Login - Shop Affiliate</title>
        <script src="https://cdn.tailwindcss.com"></script>
    </head>
    <body class="bg-gray-100 flex items-center justify-center min-h-screen">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <h1 class="text-2xl font-bold text-center mb-6 text-orange-600">Admin Login</h1>
            
            <?php if (isset($error)): ?>
                <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <form method="POST">
                <div class="mb-4">
                    <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
                        Mật khẩu
                    </label>
                    <input type="password" id="password" name="password" required
                           class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                </div>
                
                <button type="submit" 
                        class="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg transition">
                    Đăng nhập
                </button>
            </form>
            
            <p class="text-center text-gray-600 text-sm mt-4">
                Mật khẩu mặc định: admin123
            </p>
        </div>
    </body>
    </html>
    <?php
    exit;
}

// Handle logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: index.php');
    exit;
}

// Handle product operations
$db = new Database();
$conn = $db->getConnection();

$message = '';
$message_type = '';

// Add product
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action'])) {
    switch ($_POST['action']) {
        case 'add':
            $name = sanitize_input($_POST['name']);
            $description = sanitize_input($_POST['description']);
            $original_price = (float)$_POST['original_price'];
            $sale_price = (float)$_POST['sale_price'];
            $affiliate_link = sanitize_input($_POST['affiliate_link']);
            
            // Handle image upload
            $image = '';
            if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
                $validation = validate_image($_FILES['image']);
                if ($validation['success']) {
                    $upload = upload_image($_FILES['image'], '../uploads/');
                    if ($upload['success']) {
                        $image = 'uploads/' . $upload['filename'];
                    } else {
                        $message = $upload['message'];
                        $message_type = 'error';
                    }
                } else {
                    $message = $validation['message'];
                    $message_type = 'error';
                }
            }
            
            if (empty($message)) {
                $stmt = $conn->prepare("INSERT INTO products (name, description, image, original_price, sale_price, affiliate_link, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())");
                $stmt->bind_param('sssdds', $name, $description, $image, $original_price, $sale_price, $affiliate_link);
                
                if ($stmt->execute()) {
                    $message = 'Thêm sản phẩm thành công';
                    $message_type = 'success';
                } else {
                    $message = 'Lỗi khi thêm sản phẩm';
                    $message_type = 'error';
                }
            }
            break;
            
        case 'edit':
            $id = (int)$_POST['id'];
            $name = sanitize_input($_POST['name']);
            $description = sanitize_input($_POST['description']);
            $original_price = (float)$_POST['original_price'];
            $sale_price = (float)$_POST['sale_price'];
            $affiliate_link = sanitize_input($_POST['affiliate_link'];
            
            // Handle image upload
            $image_update = '';
            if (isset($_FILES['image']) && $_FILES['image']['error'] === 0) {
                $validation = validate_image($_FILES['image']);
                if ($validation['success']) {
                    $upload = upload_image($_FILES['image'], '../uploads/');
                    if ($upload['success']) {
                        $image_update = ', image = "uploads/' . $upload['filename'] . '"';
                    }
                }
            }
            
            $stmt = $conn->prepare("UPDATE products SET name = ?, description = ?, original_price = ?, sale_price = ?, affiliate_link = ?, updated_at = NOW() $image_update WHERE id = ?");
            $stmt->bind_param('ssddsi', $name, $description, $original_price, $sale_price, $affiliate_link, $id);
            
            if ($stmt->execute()) {
                $message = 'Cập nhật sản phẩm thành công';
                $message_type = 'success';
            } else {
                $message = 'Lỗi khi cập nhật sản phẩm';
                $message_type = 'error';
            }
            break;
            
        case 'delete':
            $id = (int)$_POST['id'];
            $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
            $stmt->bind_param('i', $id);
            
            if ($stmt->execute()) {
                $message = 'Xóa sản phẩm thành công';
                $message_type = 'success';
            } else {
                $message = 'Lỗi khi xóa sản phẩm';
                $message_type = 'error';
            }
            break;
    }
}

// Get products
$products = [];
$result = $conn->query("SELECT * FROM products ORDER BY created_at DESC");
while ($row = $result->fetch_assoc()) {
    $products[] = $row;
}

// Get product for editing
$edit_product = null;
if (isset($_GET['edit'])) {
    $id = (int)$_GET['edit'];
    $stmt = $conn->prepare("SELECT * FROM products WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $result = $stmt->get_result();
    $edit_product = $result->fetch_assoc();
}
?>

<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Panel - Shop Affiliate</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
</head>
<body class="bg-gray-100">
    <!-- Header -->
    <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center py-4">
                <h1 class="text-2xl font-bold text-orange-600">Admin Panel</h1>
                <div class="flex items-center space-x-4">
                    <a href="../index.html" target="_blank" class="text-gray-600 hover:text-orange-600">
                        <i data-lucide="external-link" class="h-5 w-5 inline"></i>
                        Xem trang chủ
                    </a>
                    <a href="?logout=1" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg">
                        Đăng xuất
                    </a>
                </div>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <!-- Message -->
        <?php if (!empty($message)): ?>
            <div class="mb-6 p-4 rounded-lg <?php echo $message_type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'; ?>">
                <?php echo $message; ?>
            </div>
        <?php endif; ?>

        <!-- Product Form -->
        <section class="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 class="text-xl font-bold mb-6">
                <?php echo $edit_product ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'; ?>
            </h2>
            
            <form method="POST" enctype="multipart/form-data" class="space-y-4">
                <input type="hidden" name="action" value="<?php echo $edit_product ? 'edit' : 'add'; ?>">
                <?php if ($edit_product): ?>
                    <input type="hidden" name="id" value="<?php echo $edit_product['id']; ?>">
                <?php endif; ?>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Tên sản phẩm</label>
                        <input type="text" name="name" required
                               value="<?php echo $edit_product['name'] ?? ''; ?>"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Hình ảnh</label>
                        <input type="file" name="image" accept="image/*"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                        <?php if ($edit_product && $edit_product['image']): ?>
                            <p class="text-sm text-gray-500 mt-1">Ảnh hiện tại: <?php echo $edit_product['image']; ?></p>
                        <?php endif; ?>
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                    <textarea name="description" rows="3"
                              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"><?php echo $edit_product['description'] ?? ''; ?></textarea>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Giá gốc (₫)</label>
                        <input type="number" name="original_price" step="0.01" required
                               value="<?php echo $edit_product['original_price'] ?? ''; ?>"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Giá giảm (₫)</label>
                        <input type="number" name="sale_price" step="0.01" required
                               value="<?php echo $edit_product['sale_price'] ?? ''; ?>"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                </div>
                
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Link Affiliate</label>
                    <input type="url" name="affiliate_link" required
                               value="<?php echo $edit_product['affiliate_link'] ?? ''; ?>"
                               class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                </div>
                
                <div class="flex space-x-4">
                    <button type="submit" 
                            class="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg">
                        <?php echo $edit_product ? 'Cập nhật' : 'Thêm sản phẩm'; ?>
                    </button>
                    <?php if ($edit_product): ?>
                        <a href="index.php" class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg">
                            Hủy
                        </a>
                    <?php endif; ?>
                </div>
            </form>
        </section>

        <!-- Products List -->
        <section class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-bold mb-6">Danh sách sản phẩm</h2>
            
            <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hình ảnh</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên sản phẩm</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá gốc</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giá giảm</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảm giá</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <?php foreach ($products as $product): ?>
                            <tr>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <?php if ($product['image']): ?>
                                        <img src="../<?php echo $product['image']; ?>" alt="<?php echo $product['name']; ?>" 
                                             class="h-12 w-12 object-cover rounded">
                                    <?php else: ?>
                                        <div class="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                                            <i data-lucide="image" class="h-6 w-6 text-gray-400"></i>
                                        </div>
                                    <?php endif; ?>
                                </td>
                                <td class="px-6 py-4">
                                    <div class="text-sm font-medium text-gray-900"><?php echo $product['name']; ?></div>
                                    <div class="text-sm text-gray-500 max-w-xs truncate"><?php echo $product['description']; ?></div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    <?php echo format_price($product['original_price']); ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                    <?php echo format_price($product['sale_price']); ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <?php 
                                    $discount = 0;
                                    if ($product['original_price'] > $product['sale_price']) {
                                        $discount = round(($product['original_price'] - $product['sale_price']) / $product['original_price'] * 100);
                                    }
                                    ?>
                                    <?php if ($discount > 0): ?>
                                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                            -<?php echo $discount; ?>%
                                        </span>
                                    <?php else: ?>
                                        <span class="text-gray-400">-</span>
                                    <?php endif; ?>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                    <a href="?edit=<?php echo $product['id']; ?>" class="text-indigo-600 hover:text-indigo-900 mr-3">Sửa</a>
                                    <form method="POST" style="display: inline;" onsubmit="return confirm('Bạn có chắc muốn xóa sản phẩm này?')">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="id" value="<?php echo $product['id']; ?>">
                                        <button type="submit" class="text-red-600 hover:text-red-900">Xóa</button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
                
                <?php if (empty($products)): ?>
                    <div class="text-center py-8">
                        <i data-lucide="package" class="h-12 w-12 text-gray-400 mx-auto mb-4"></i>
                        <p class="text-gray-500">Chưa có sản phẩm nào</p>
                    </div>
                <?php endif; ?>
            </div>
        </section>
    </main>

    <script>
        // Initialize Lucide icons
        lucide.createIcons();
    </script>
</body>
</html>