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

    $user_id = (int)$data['user_id'];
    $court = (int)$data['court'];
    $date = $data['date'];
    $time = $data['time'];
    $rate = $data['rate'];
    $duration = $data['duration'];
    $total = (float)$data['total'];
    $notes = isset($data['notes']) ? $data['notes'] : '';
    $payment = isset($data['payment']) ? $data['payment'] : 'cash';
    
    // Extract equipment
    $equipment = isset($data['equipment']) ? $data['equipment'] : [];

    // Check if court is available
    $stmt = $pdo->prepare("SELECT * FROM bookings WHERE court_number = ? AND booking_date = ? AND time_slot = ? AND status != 'cancelled'");
    $stmt->execute([$court, $date, $time]);
    
    if ($stmt->fetch()) {
        echo json_encode(['isOk' => false, 'message' => 'This court is already booked for the selected time.']);
        exit;
    }

    // Insert booking
    $stmt = $pdo->prepare("INSERT INTO bookings (user_id, court_number, booking_date, time_slot, rate_type, duration, total_amount, notes, payment_method, status, created_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', NOW())");
    
    if ($stmt->execute([$user_id, $court, $date, $time, $rate, $duration, $total, $notes, $payment])) {
        $booking_id = $pdo->lastInsertId();
        
        // Insert equipment if any
        if (!empty($equipment)) {
            if ($equipment['racket'] > 0) {
                $stmt = $pdo->prepare("INSERT INTO booking_equipment (booking_id, equipment_type, quantity, price) VALUES (?, 'racket', ?, 50)");
                $stmt->execute([$booking_id, $equipment['racket']]);
            }
            
            if ($equipment['shuttlecock'] > 0) {
                $stmt = $pdo->prepare("INSERT INTO booking_equipment (booking_id, equipment_type, quantity, price) VALUES (?, 'shuttlecock', ?, 30)");
                $stmt->execute([$booking_id, $equipment['shuttlecock']]);
            }
            
            if ($equipment['towel'] > 0) {
                $stmt = $pdo->prepare("INSERT INTO booking_equipment (booking_id, equipment_type, quantity, price) VALUES (?, 'towel', ?, 20)");
                $stmt->execute([$booking_id, $equipment['towel']]);
            }
        }
        
        echo json_encode([
            'isOk' => true,
            'message' => 'Booking confirmed successfully!',
            'booking_id' => 'BKG' . str_pad($booking_id, 6, '0', STR_PAD_LEFT)
        ]);
    } else {
        echo json_encode(['isOk' => false, 'message' => 'Failed to create booking.']);
    }

} catch (PDOException $e) {
    echo json_encode(['isOk' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>