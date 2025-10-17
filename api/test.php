<?php
// Test API endpoint for debugging
header('Content-Type: application/json');

// Test database connection
require_once '../config.php';

try {
    $db = new Database();
    $conn = $db->getConnection();
    
    // Test simple query
    $result = $conn->query("SELECT COUNT(*) as count FROM products");
    $row = $result->fetch_assoc();
    
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'product_count' => $row['count'],
        'server_info' => [
            'php_version' => PHP_VERSION,
            'server_time' => date('Y-m-d H:i:s'),
            'document_root' => $_SERVER['DOCUMENT_ROOT'] ?? 'unknown',
            'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
        ]
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => $e->getMessage()
    ]);
}
?>