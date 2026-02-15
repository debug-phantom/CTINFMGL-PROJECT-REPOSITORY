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

    // Extract data
    $user_id = isset($data['user_id']) ? (int)$data['user_id'] : 0;
    $court_number = isset($data['court']) ? (int)$data['court'] : 0;
    $booking_date = $data['date'] ?? '';
    $time_slot = $data['time'] ?? '';
    $rate_type = ($data['rate'] ?? 'hourly') == 'all' ? 'play_all' : 'hourly';
    $total_amount = isset($data['total']) ? (float)$data['total'] : 0;
    $payment_method = isset($data['paymentMethod']) ? $data['paymentMethod'] : 'cash';
    $customer_name = $data['customer_name'] ?? '';
    $user_email = $data['email'] ?? '';
    $phone = $data['phone'] ?? '';

    // Validate required fields
    if (!$court_number || !$booking_date || !$time_slot) {
        echo json_encode(['isOk' => false, 'message' => 'Missing required booking information.']);
        exit;
    }

    // If no user_id, create a guest user record
    if ($user_id == 0 && $user_email) {
        // Check if user exists by email
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$user_email]);
        $existingUser = $stmt->fetch();
        
        if ($existingUser) {
            $user_id = $existingUser['id'];
        } else {
            // Create guest user
            $stmt = $pdo->prepare("INSERT INTO users (full_name, email, phone, password, created_at) VALUES (?, ?, ?, ?, NOW())");
            $stmt->execute([$customer_name ?: 'Guest', $user_email, $phone, password_hash('guest' . time(), PASSWORD_DEFAULT)]);
            $user_id = $pdo->lastInsertId();
        }
    }

    // Get court_id from court_number
    $stmt = $pdo->prepare("SELECT id FROM courts WHERE court_number = ?");
    $stmt->execute([$court_number]);
    $court = $stmt->fetch();
    
    if (!$court) {
        echo json_encode(['isOk' => false, 'message' => 'Court not found.']);
        exit;
    }
    $court_id = $court['id'];

    // Parse time slot to get start and end time
    list($start_time, $end_time) = explode('-', $time_slot);
    $start_time = trim($start_time);
    $end_time = trim($end_time);

    // Find time slot in database
    $stmt = $pdo->prepare("SELECT id FROM time_slots WHERE start_time = ? AND end_time = ?");
    $stmt->execute([$start_time . ':00', $end_time . ':00']);
    $time_slot_data = $stmt->fetch();
    
    if (!$time_slot_data) {
        // Create time slot if it doesn't exist
        $stmt = $pdo->prepare("INSERT INTO time_slots (slot_name, start_time, end_time, created_at) VALUES (?, ?, ?, NOW())");
        $slot_name = $start_time . ' - ' . $end_time;
        $stmt->execute([$slot_name, $start_time . ':00', $end_time . ':00']);
        $time_slot_id = $pdo->lastInsertId();
    } else {
        $time_slot_id = $time_slot_data['id'];
    }

    // Check if court is already booked for this time
    $stmt = $pdo->prepare("SELECT * FROM bookings WHERE court_id = ? AND booking_date = ? AND time_slot_id = ? AND status IN ('confirmed', 'pending')");
    $stmt->execute([$court_id, $booking_date, $time_slot_id]);
    
    if ($stmt->fetch()) {
        echo json_encode(['isOk' => false, 'message' => 'This court is already booked for the selected time.']);
        exit;
    }

    // Calculate duration (assuming 2-hour slots for now)
    $duration_hours = 2.0;

    // Insert booking
    $stmt = $pdo->prepare("INSERT INTO bookings (user_id, court_id, time_slot_id, booking_date, duration_hours, total_price, booking_type, rate_type, payment_method, status, payment_status, special_notes, created_at) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed', 'paid', ?, NOW())");
    
    $booking_type = ($rate_type == 'play_all') ? 'play_all' : 'hourly';
    $notes = "Equipment: " . json_encode($data['equip'] ?? []);
    
    if ($stmt->execute([$user_id, $court_id, $time_slot_id, $booking_date, $duration_hours, $total_amount, $booking_type, $rate_type, $payment_method, $notes])) {
        $booking_id = $pdo->lastInsertId();
        
        // Insert equipment if any
        if (isset($data['equip']) && is_array($data['equip'])) {
            $equipment_prices = [
                'racket' => 50,
                'shuttlecock' => 30,
                'shoes' => 80,
                'water' => 15
            ];
            
            foreach ($data['equip'] as $item => $quantity) {
                if ($quantity > 0) {
                    // Find equipment in database or create it
                    $stmt = $pdo->prepare("SELECT id FROM equipment WHERE equipment_name LIKE ?");
                    $stmt->execute(['%' . $item . '%']);
                    $equipment = $stmt->fetch();
                    
                    if ($equipment) {
                        $equipment_id = $equipment['id'];
                    } else {
                        $stmt = $pdo->prepare("INSERT INTO equipment (equipment_name, equipment_type, rental_price, quantity_available, created_at) VALUES (?, ?, ?, 10, NOW())");
                        $equipment_type = ($item == 'racket') ? 'racket' : (($item == 'shuttlecock') ? 'shuttlecock' : 'other');
                        $stmt->execute([ucfirst($item), $equipment_type, $equipment_prices[$item] ?? 0]);
                        $equipment_id = $pdo->lastInsertId();
                    }
                    
                    // Link equipment to booking
                    $stmt = $pdo->prepare("INSERT INTO booking_equipment (booking_id, equipment_id, quantity, subtotal, created_at) VALUES (?, ?, ?, ?, NOW())");
                    $subtotal = ($equipment_prices[$item] ?? 0) * $quantity;
                    $stmt->execute([$booking_id, $equipment_id, $quantity, $subtotal]);
                }
            }
        }
        
        // Insert payment record
        $stmt = $pdo->prepare("INSERT INTO payments (booking_id, user_id, amount, payment_method, payment_date, status, notes) VALUES (?, ?, ?, ?, NOW(), 'success', 'Online payment via website')");
        $stmt->execute([$booking_id, $user_id, $total_amount, $payment_method]);
        
        // Create booking reference ID
        $booking_ref = 'KPBC-' . strtoupper(substr(md5($booking_id . time()), 0, 8));
        
        echo json_encode([
            'isOk' => true,
            'message' => 'Booking confirmed successfully!',
            'booking_id' => $booking_ref,
            'database_id' => $booking_id,
            'email_sent' => !empty($user_email)
        ]);
    } else {
        echo json_encode(['isOk' => false, 'message' => 'Failed to create booking.']);
    }

} catch (PDOException $e) {
    echo json_encode(['isOk' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
?>