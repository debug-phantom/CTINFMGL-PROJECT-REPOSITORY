<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) {
    echo json_encode(['isOk' => false, 'message' => 'No data received']);
    exit;
}

$booking_id = $input['booking_id'] ?? 0;
$action     = $input['action'] ?? '';

$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "kpbc_db";

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    echo json_encode(['isOk' => false, 'message' => 'Database connection failed']);
    exit;
}

if ($action === 'delete') {
    $stmt = $conn->prepare("DELETE FROM bookings WHERE id = ?");
    $stmt->bind_param("i", $booking_id);
    $success = $stmt->execute();
    $message = $success ? 'Booking deleted' : 'Delete failed';
} else {
    $status = $action === 'confirm' ? 'confirmed' : 'cancelled';
    $stmt = $conn->prepare("UPDATE bookings SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $booking_id);
    $success = $stmt->execute();
    $message = $success ? "Booking $status" : "Update failed";
}

echo json_encode([
    'isOk' => $success,
    'message' => $message,
    'action' => $action,
    'booking_id' => $booking_id
]);

$stmt->close();
$conn->close();
?>