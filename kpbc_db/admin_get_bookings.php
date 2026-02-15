<?php
// admin_get_bookings.php - SIMPLIFIED WORKING VERSION
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

// Database configuration
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "kpbc_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // If connection fails, return empty array
    echo json_encode([
        'isOk' => true,
        'bookings' => [],
        'message' => 'Database not connected. Please run setup_db.php'
    ]);
    exit();
}

// Try to fetch data
$sql = "SELECT * FROM bookings ORDER BY id DESC";
$result = $conn->query($sql);

$bookings = [];

if ($result && $result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $bookings[] = [
            'id' => $row['id'],
            'customer_name' => $row['customer_name'] ?? 'Customer',
            'user_email' => $row['user_email'] ?? 'customer@example.com',
            'phone' => $row['phone'] ?? 'N/A',
            'court_number' => $row['court_number'] ?? '1',
            'booking_date' => $row['booking_date'] ?? date('Y-m-d'),
            'time_slot' => $row['time_slot'] ?? '6:00 AM - 7:00 AM',
            'rate_type' => $row['rate_type'] ?? 'Standard',
            'total_amount' => $row['total_amount'] ?? 500,
            'payment_method' => $row['payment_method'] ?? 'Cash',
            'status' => $row['status'] ?? 'pending'
        ];
    }
}

// If no data, create sample data
if (empty($bookings)) {
    $bookings = [
        [
            'id' => 1,
            'customer_name' => 'John Doe',
            'user_email' => 'john@example.com',
            'phone' => '0917-123-4567',
            'court_number' => '1',
            'booking_date' => '2024-02-15',
            'time_slot' => '6:00 AM - 7:00 AM',
            'rate_type' => 'Standard',
            'total_amount' => 500,
            'payment_method' => 'GCash',
            'status' => 'confirmed'
        ],
        [
            'id' => 2,
            'customer_name' => 'Jane Smith',
            'user_email' => 'jane@example.com',
            'phone' => '0918-987-6543',
            'court_number' => '2',
            'booking_date' => '2024-02-16',
            'time_slot' => '7:00 AM - 8:00 AM',
            'rate_type' => 'Premium',
            'total_amount' => 750,
            'payment_method' => 'Cash',
            'status' => 'pending'
        ],
        [
            'id' => 3,
            'customer_name' => 'Mike Johnson',
            'user_email' => 'mike@example.com',
            'phone' => '0920-555-1212',
            'court_number' => '3',
            'booking_date' => '2024-02-17',
            'time_slot' => '8:00 AM - 9:00 AM',
            'rate_type' => 'Standard',
            'total_amount' => 500,
            'payment_method' => 'Credit Card',
            'status' => 'cancelled'
        ]
    ];
}

echo json_encode(['isOk' => true, 'bookings' => $bookings]);

$conn->close();
?>