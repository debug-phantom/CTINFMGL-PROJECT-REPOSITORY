<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Database configuration
$host = 'localhost';
$dbname = 'kpbc_db';
$username = 'root';
$password = '';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $json = file_get_contents('php://input');
    $data = json_decode($json, true);

    if (!$data) {
        echo json_encode(['isOk' => false, 'message' => 'Invalid data provided.']);
        exit;
    }

    $full_name = trim($data['full_name']);
    $email = trim($data['email']);
    $phone = trim($data['phone']);
    $password_raw = $data['password'];

    // Validation
    if (empty($full_name) || empty($email) || empty($phone) || empty($password_raw)) {
        echo json_encode(['isOk' => false, 'message' => 'Please fill in all fields.']);
        exit;
    }

    // Check if email already exists
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    if ($stmt->fetch()) {
        echo json_encode(['isOk' => false, 'message' => 'Email is already registered.']);
        exit;
    }

    // Hash and Insert
    $hashed_password = password_hash($password_raw, PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)");
    
    if ($stmt->execute([$full_name, $email, $phone, $hashed_password])) {
        $userId = $pdo->lastInsertId();
        
        echo json_encode([
            'isOk' => true,
            'message' => 'Registration successful!',
            'user' => [
                'id' => $userId,
                'full_name' => $full_name,
                'email' => $email,
                'phone' => $phone
            ]
        ]);
    } else {
        echo json_encode(['isOk' => false, 'message' => 'Failed to create account.']);
    }

} catch (PDOException $e) {
    echo json_encode(['isOk' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>