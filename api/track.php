<?php
require_once '../config.php';

header('Content-Type: application/json');

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    send_error_response('Method not allowed', 405);
}

try {
    // Get JSON input
    $json_input = file_get_contents('php://input');
    $data = json_decode($json_input, true);
    
    if (!$data) {
        send_error_response('Invalid JSON data');
    }
    
    $product_id = isset($data['product_id']) ? (int)$data['product_id'] : 0;
    $action = isset($data['action']) ? sanitize_input($data['action']) : '';
    
    if ($product_id <= 0 || empty($action)) {
        send_error_response('Missing required parameters');
    }
    
    $db = new Database();
    $conn = $db->getConnection();
    
    // Get user IP and user agent
    $ip_address = $_SERVER['REMOTE_ADDR'];
    $user_agent = isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_input($_SERVER['HTTP_USER_AGENT']) : '';
    
    // Insert tracking record
    $stmt = $conn->prepare("INSERT INTO product_tracking (product_id, action, ip_address, user_agent, created_at) VALUES (?, ?, ?, ?, NOW())");
    $stmt->bind_param('isss', $product_id, $action, $ip_address, $user_agent);
    
    if ($stmt->execute()) {
        send_success_response(null, 'Tracking recorded successfully');
    } else {
        send_error_response('Failed to record tracking');
    }
    
} catch (Exception $e) {
    send_error_response('Lỗi server: ' . $e->getMessage(), 500);
}
?>