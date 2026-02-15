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

if (!$data || !isset($data['user_id'])) {
    echo json_encode(['isOk' => false, 'message' => 'User ID required.']);
    exit();
}

$user_id = (int)$data['user_id'];

// Get user's bookings
$sql = "SELECT b.*, 
               GROUP_CONCAT(CONCAT(be.equipment_type, ':', be.quantity)) as equipment
        FROM bookings b
        LEFT JOIN booking_equipment be ON b.id = be.booking_id
        WHERE b.user_id = '$user_id'
        GROUP BY b.id
        ORDER BY b.booking_date DESC, b.created_at DESC";

$result = $conn->query($sql);

$bookings = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Parse equipment string
        $equipment = [];
        if (!empty($row['equipment'])) {
            $items = explode(',', $row['equipment']);
            foreach ($items as $item) {
                list($type, $qty) = explode(':', $item);
                $equipment[$type] = (int)$qty;
            }
        }
        
        $bookings[] = [
            'id' => $row['id'],
            'booking_id' => 'BKG' . str_pad($row['id'], 6, '0', STR_PAD_LEFT),
            'court' => $row['court_number'],
            'date' => $row['booking_date'],
            'time' => $row['time_slot'],
            'duration' => $row['duration'],
            'total' => (float)$row['total_amount'],
            'notes' => $row['notes'],
            'status' => $row['status'],
            'created_at' => $row['created_at'],
            'equipment' => $equipment
        ];
    }
}

echo json_encode([
    'isOk' => true,
    'bookings' => $bookings
]);

$conn->close();
?>