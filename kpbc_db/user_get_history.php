<?php
// user_get_history.php – Returns all bookings for a given email
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "kpbc_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Get email from query string
$email = isset($_GET['email']) ? trim($_GET['email']) : '';
if (!$email) {
    echo json_encode(['error' => 'No email provided']);
    exit;
}

// Fetch all bookings for this email, newest first
$stmt = $conn->prepare("
    SELECT id, court_number, booking_date, time_slot, rate_type, total_amount, status, created_at
    FROM bookings
    WHERE user_email = ?
    ORDER BY booking_date DESC, time_slot ASC
");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

$bookings = [];
while ($row = $result->fetch_assoc()) {
    // Format slot name (e.g., "08:00-10:00" → "8:00 AM – 10:00 AM")
    $slot = $row['time_slot'];
    $formattedSlot = formatTimeSlot($slot);
    
    $bookings[] = [
        'id' => $row['id'],
        'court_number' => $row['court_number'],
        'booking_date' => $row['booking_date'],
        'slot_name' => $formattedSlot,
        'rate_type' => $row['rate_type'],
        'total_amount' => $row['total_amount'],
        'status' => ucfirst($row['status']),
        'created_at' => $row['created_at']
    ];
}

$stmt->close();
$conn->close();

echo json_encode($bookings);
exit;

// Helper: convert "08:00-10:00" to "8:00 AM – 10:00 AM"
function formatTimeSlot($slot) {
    if (strpos($slot, '-') === false) return $slot;
    list($start, $end) = explode('-', $slot, 2);
    return formatTime($start) . ' – ' . formatTime($end);
}

function formatTime($time) {
    if (strlen($time) === 5 && strpos($time, ':') !== false) {
        return date("g:i A", strtotime($time));
    }
    return $time;
}
?>