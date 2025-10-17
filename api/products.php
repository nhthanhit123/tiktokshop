<?php
require_once '../config.php';

header('Content-Type: application/json');

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get query parameters
    $category = isset($_GET['category']) ? sanitize_input($_GET['category']) : '';
    $sort = isset($_GET['sort']) ? sanitize_input($_GET['sort']) : 'newest';
    $search = isset($_GET['search']) ? sanitize_input($_GET['search']) : '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    // Build base query
    $sql = "SELECT * FROM products WHERE 1=1";
    $params = [];
    $types = '';
    
    // Add search filter
    if (!empty($search)) {
        $sql .= " AND (name LIKE ? OR description LIKE ?)";
        $search_param = '%' . $search . '%';
        $params[] = $search_param;
        $params[] = $search_param;
        $types .= 'ss';
    }
    
    // Add category filter
    if (!empty($category)) {
        switch ($category) {
            case 'flashsale':
                $sql .= " AND ((original_price - sale_price) / original_price * 100) >= 50";
                break;
            case 'discount':
                $sql .= " AND original_price > sale_price";
                break;
        }
    }
    
    // Add sorting
    switch ($sort) {
        case 'price-low':
            $sql .= " ORDER BY sale_price ASC";
            break;
        case 'price-high':
            $sql .= " ORDER BY sale_price DESC";
            break;
        case 'discount':
            $sql .= " ORDER BY ((original_price - sale_price) / original_price * 100) DESC";
            break;
        case 'newest':
        default:
            $sql .= " ORDER BY created_at DESC";
            break;
    }
    
    // Add pagination
    $sql .= " LIMIT ? OFFSET ?";
    $params[] = $limit;
    $params[] = $offset;
    $types .= 'ii';
    
    // Prepare and execute query
    $stmt = $conn->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $products = [];
    while ($row = $result->fetch_assoc()) {
        // Format product data
        $product = [
            'id' => (int)$row['id'],
            'name' => $row['name'],
            'description' => $row['description'],
            'image' => $row['image'],
            'original_price' => (float)$row['original_price'],
            'sale_price' => (float)$row['sale_price'],
            'affiliate_link' => $row['affiliate_link'],
            'created_at' => $row['created_at'],
            'updated_at' => $row['updated_at'],
            // Add mock data for mobile app feel
            'sold_count' => rand(100, 5000),
            'rating' => round(rand(30, 50) / 10, 1),
            'review_count' => rand(10, 500),
            'is_official' => rand(0, 1) === 1,
            'is_freeship' => true,
            'category' => 'electronics', // Mock category
            'brand' => 'Official Brand' // Mock brand
        ];
        
        // Calculate discount percentage
        if ($row['original_price'] > $row['sale_price']) {
            $product['discount_percentage'] = round(($row['original_price'] - $row['sale_price']) / $row['original_price'] * 100);
        } else {
            $product['discount_percentage'] = 0;
        }
        
        $products[] = $product;
    }
    
    // Get total count for pagination
    $count_sql = "SELECT COUNT(*) as total FROM products WHERE 1=1";
    $count_params = [];
    $count_types = '';
    
    if (!empty($search)) {
        $count_sql .= " AND (name LIKE ? OR description LIKE ?)";
        $count_params[] = '%' . $search . '%';
        $count_params[] = '%' . $search . '%';
        $count_types .= 'ss';
    }
    
    if (!empty($category)) {
        switch ($category) {
            case 'flashsale':
                $count_sql .= " AND ((original_price - sale_price) / original_price * 100) >= 50";
                break;
            case 'discount':
                $count_sql .= " AND original_price > sale_price";
                break;
        }
    }
    
    $count_stmt = $conn->prepare($count_sql);
    if (!empty($count_params)) {
        $count_stmt->bind_param($count_types, ...$count_params);
    }
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $total_count = $count_result->fetch_assoc()['total'];
    
    // Send response
    send_json_response([
        'success' => true,
        'data' => $products,
        'pagination' => [
            'total' => (int)$total_count,
            'limit' => $limit,
            'offset' => $offset,
            'has_more' => ($offset + $limit) < $total_count
        ]
    ]);
    
} catch (Exception $e) {
    send_error_response('Lỗi server: ' . $e->getMessage(), 500);
}
?>