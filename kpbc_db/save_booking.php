<?php
// Turn off all error reporting to prevent HTML output
error_reporting(0);
ini_set('display_errors', 0);

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $servername = "localhost";
    $username   = "root";
    $password   = "";
    $dbname     = "kpbc_db";

    $conn = new mysqli($servername, $username, $password, $dbname);
    if ($conn->connect_error) {
        throw new Exception('Database connection failed: ' . $conn->connect_error);
    }

    // ---------- FORCE CORRECT TABLE STRUCTURE ----------
    // Drop the old table if it exists (comment this out after first run)
    $conn->query("DROP TABLE IF EXISTS bookings");

    // Create the table with the exact required columns
    $conn->query("
        CREATE TABLE IF NOT EXISTS bookings (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_name VARCHAR(100),
            user_email VARCHAR(100),
            phone VARCHAR(20),
            court_number VARCHAR(10),
            booking_date DATE,
            time_slot VARCHAR(50),
            rate_type VARCHAR(50),
            total_amount DECIMAL(10,2),
            payment_method VARCHAR(50),
            status VARCHAR(20) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");
    // ---------------------------------------------------

    // Read and validate input
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        throw new Exception('Invalid JSON input');
    }

    // Required fields
    $required = ['customer_name', 'user_email', 'phone', 'court_number', 'booking_date', 'time_slot', 'rate_type', 'total_amount', 'payment_method', 'status'];
    foreach ($required as $field) {
        if (!isset($input[$field])) {
            throw new Exception("Missing field: $field");
        }
    }

    // Prepare and execute
    $stmt = $conn->prepare("
        INSERT INTO bookings 
        (customer_name, user_email, phone, court_number, booking_date, time_slot, rate_type, total_amount, payment_method, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->bind_param(
        "sssssssdss",
        $input['customer_name'],
        $input['user_email'],
        $input['phone'],
        $input['court_number'],
        $input['booking_date'],
        $input['time_slot'],
        $input['rate_type'],
        $input['total_amount'],
        $input['payment_method'],
        $input['status']
    );

    if ($stmt->execute()) {
        $bookingId = $stmt->insert_id;
        $formattedId = 'KPBC-' . date('Ymd') . '-' . str_pad($bookingId, 4, '0', STR_PAD_LEFT);
        echo json_encode([
            'isOk' => true,
            'booking_id' => $bookingId,
            'formatted_id' => $formattedId,
            'message' => 'Booking confirmed successfully'
        ]);
    } else {
        throw new Exception('Database error: ' . $stmt->error);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    echo json_encode([
        'isOk' => false,
        'message' => $e->getMessage()
    ]);
}
?>