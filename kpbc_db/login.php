<?php
include 'db_connect.php';
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['isOk' => false, 'message' => 'Invalid request data']);
    exit();
}

$email = $conn->real_escape_string($data['email']);
$password = $data['password'];

// Use prepared statement to prevent SQL injection
$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if (password_verify($password, $user['password'])) {
        unset($user['password']);
        echo json_encode(['isOk' => true, 'user' => $user]);
    } else {
        echo json_encode(['isOk' => false, 'message' => 'Invalid password']);
    }
} else {
    echo json_encode(['isOk' => false, 'message' => 'User not found']);
}

$stmt->close();
$conn->close();
?>