-- ============================================
-- KATIPUNAN PRIME BADMINTON CENTER - FULL DATABASE SETUP
-- ============================================

-- 1. CREATE DATABASE
DROP DATABASE IF EXISTS kpbc_db;
CREATE DATABASE kpbc_db;
USE kpbc_db;

-- 2. CREATE USERS TABLE (for customer registration/login)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- 3. CREATE COURTS TABLE
CREATE TABLE courts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    court_number INT UNIQUE NOT NULL,
    court_name VARCHAR(50) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 170.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status)
);

-- 4. CREATE TIME_SLOTS TABLE
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slot_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_peak_hour BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. CREATE BOOKINGS TABLE
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    court_id INT NOT NULL,
    time_slot_id INT NOT NULL,
    booking_date DATE NOT NULL,
    duration_hours DECIMAL(4,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    booking_type ENUM('hourly', 'play_all') DEFAULT 'hourly',
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
    payment_status ENUM('unpaid', 'paid', 'refunded') DEFAULT 'unpaid',
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (court_id) REFERENCES courts(id) ON DELETE CASCADE,
    FOREIGN KEY (time_slot_id) REFERENCES time_slots(id) ON DELETE CASCADE,
    INDEX idx_booking_date (booking_date),
    INDEX idx_user_date (user_id, booking_date),
    INDEX idx_court_date (court_id, booking_date),
    UNIQUE KEY unique_court_timeslot (court_id, time_slot_id, booking_date)
);

-- 6. CREATE EQUIPMENT TABLE
CREATE TABLE equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_type ENUM('racket', 'shuttlecock', 'towel', 'other') NOT NULL,
    rental_price DECIMAL(10,2) NOT NULL,
    quantity_available INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (equipment_type)
);

-- 7. CREATE BOOKING_EQUIPMENT TABLE (for equipment rentals)
CREATE TABLE booking_equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    equipment_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
);

-- 8. CREATE PRICING TABLE
CREATE TABLE pricing (
    id INT PRIMARY KEY AUTO_INCREMENT,
    rate_type ENUM('hourly', 'play_all', 'equipment') NOT NULL,
    rate_name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rate_type (rate_type),
    INDEX idx_active (is_active)
);

-- 9. CREATE PAYMENTS TABLE
CREATE TABLE payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    user_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('cash', 'gcash', 'paymaya', 'credit_card', 'bank_transfer') DEFAULT 'cash',
    transaction_id VARCHAR(100),
    reference_number VARCHAR(100),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
    notes TEXT,
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_transaction (transaction_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_status (status)
);

-- 10. CREATE ADMINS TABLE (for future admin panel)
CREATE TABLE admins (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role ENUM('super_admin', 'manager', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- 11. CREATE ACTIVITY_LOG TABLE (for audit trail)
CREATE TABLE activity_log (
    id INT PRIMARY KEY AUTO_INCREMENT,
    admin_id INT NULL,
    user_id INT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_activity_type (activity_type),
    INDEX idx_created_at (created_at)
);

-- ============================================
-- INSERT DEFAULT DATA
-- ============================================

-- Insert default courts (1-10)
INSERT INTO courts (court_number, court_name, status, hourly_rate) VALUES
(1, 'Court 1 - Premium', 'available', 180.00),
(2, 'Court 2 - Premium', 'available', 180.00),
(3, 'Court 3 - Standard', 'available', 170.00),
(4, 'Court 4 - Standard', 'available', 170.00),
(5, 'Court 5 - Standard', 'available', 170.00),
(6, 'Court 6 - Standard', 'available', 170.00),
(7, 'Court 7 - Standard', 'available', 170.00),
(8, 'Court 8 - Standard', 'available', 170.00),
(9, 'Court 9 - Standard', 'available', 170.00),
(10, 'Court 10 - Premium', 'maintenance', 180.00);

-- Insert time slots (7AM to 10PM, 2-hour slots)
INSERT INTO time_slots (slot_name, start_time, end_time, is_peak_hour) VALUES
('Early Morning', '07:00:00', '09:00:00', FALSE),
('Morning', '09:00:00', '11:00:00', FALSE),
('Late Morning', '11:00:00', '13:00:00', FALSE),
('Early Afternoon', '13:00:00', '15:00:00', FALSE),
('Afternoon', '15:00:00', '17:00:00', TRUE),
('Early Evening', '17:00:00', '19:00:00', TRUE),
('Evening', '19:00:00', '21:00:00', TRUE),
('Late Evening', '21:00:00', '23:00:00', FALSE);

-- Insert equipment
INSERT INTO equipment (equipment_name, equipment_type, rental_price, quantity_available, description) VALUES
('Yonex Astrox 99 Pro', 'racket', 80.00, 10, 'Premium tournament racket'),
('Yonex Nanoflare 800', 'racket', 70.00, 15, 'Speed-focused racket'),
('Victor Thruster K', 'racket', 60.00, 12, 'Power and control racket'),
('Yonex Aerosensa 50', 'shuttlecock', 30.00, 100, 'Tournament grade shuttlecock'),
('Victor Champion No. 3', 'shuttlecock', 25.00, 80, 'Practice shuttlecock'),
('Premium Cotton Towel', 'towel', 20.00, 50, 'Large sports towel'),
('Sports Grip Tape', 'other', 15.00, 60, 'Non-slip grip tape'),
('Badminton Shoes', 'other', 50.00, 20, 'Court shoes rental'),
('Sports Bag', 'other', 30.00, 15, 'Racket bag rental');

-- Insert pricing
INSERT INTO pricing (rate_type, rate_name, price, description, is_active) VALUES
('hourly', 'Standard Hourly Rate', 170.00, 'Regular hourly rate for all courts', TRUE),
('hourly', 'Premium Court Hourly', 180.00, 'Hourly rate for premium courts (1,2,10)', TRUE),
('hourly', 'Off-Peak Discount', 150.00, 'Discounted rate for non-peak hours', TRUE),
('play_all', 'Weekday Play-All', 200.00, 'Unlimited play on weekdays (Mon-Fri)', TRUE),
('play_all', 'Weekend Play-All', 250.00, 'Unlimited play on weekends (Sat-Sun)', TRUE),
('play_all', 'Student Play-All', 180.00, 'Student discount unlimited play', TRUE),
('equipment', 'Premium Racket Rental', 80.00, 'High-end racket rental', TRUE),
('equipment', 'Standard Racket Rental', 50.00, 'Standard racket rental', TRUE),
('equipment', 'Shuttlecock Rental', 30.00, 'Per tube (12 pieces)', TRUE);

-- Insert default admin (password: admin123 - you should change this!)
INSERT INTO admins (username, email, password, full_name, role, is_active) VALUES
('superadmin', 'admin@katipunanprime.com', '$2y$10$N9qo8uLOickgx2ZMRZo5MeMHdL7L2jLcHrB7vJYz0QyZJ8KXqL1zW', 'System Administrator', 'super_admin', TRUE),
('manager1', 'manager@katipunanprime.com', '$2y$10$N9qo8uLOickgx2ZMRZo5MeMHdL7L2jLcHrB7vJYz0QyZJ8KXqL1zW', 'Court Manager', 'manager', TRUE),
('staff1', 'staff@katipunanprime.com', '$2y$10$N9qo8uLOickgx2ZMRZo5MeMHdL7L2jLcHrB7vJYz0QyZJ8KXqL1zW', 'Front Desk Staff', 'staff', TRUE);

-- Insert test user (password: test123)
INSERT INTO users (full_name, email, phone, password) VALUES
('Juan Dela Cruz', 'juan@example.com', '09171234567', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('Maria Santos', 'maria@example.com', '09221234567', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'),
('Pedro Gonzales', 'pedro@example.com', '09331234567', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW');

-- ============================================
-- CREATE STORED PROCEDURES
-- ============================================

-- Procedure to check court availability
DELIMITER //
CREATE PROCEDURE CheckCourtAvailability(
    IN p_court_id INT,
    IN p_booking_date DATE,
    IN p_time_slot_id INT
)
BEGIN
    DECLARE v_is_available BOOLEAN;
    DECLARE v_court_status VARCHAR(20);
    DECLARE v_booking_count INT;
    
    -- Check court status
    SELECT status INTO v_court_status FROM courts WHERE id = p_court_id;
    
    -- Check if already booked
    SELECT COUNT(*) INTO v_booking_count 
    FROM bookings 
    WHERE court_id = p_court_id 
      AND booking_date = p_booking_date 
      AND time_slot_id = p_time_slot_id 
      AND status IN ('confirmed', 'pending');
    
    IF v_court_status = 'available' AND v_booking_count = 0 THEN
        SELECT TRUE AS is_available, 'Court is available' AS message;
    ELSEIF v_court_status = 'maintenance' THEN
        SELECT FALSE AS is_available, 'Court is under maintenance' AS message;
    ELSE
        SELECT FALSE AS is_available, 'Court is already booked' AS message;
    END IF;
END //
DELIMITER ;

-- Procedure to create a booking
DELIMITER //
CREATE PROCEDURE CreateBooking(
    IN p_user_id INT,
    IN p_court_id INT,
    IN p_time_slot_id INT,
    IN p_booking_date DATE,
    IN p_duration_hours DECIMAL(4,2),
    IN p_booking_type VARCHAR(20),
    IN p_total_price DECIMAL(10,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SELECT FALSE AS success, 'Booking failed' AS message;
    END;
    
    START TRANSACTION;
    
    -- Insert the booking
    INSERT INTO bookings (
        user_id, court_id, time_slot_id, booking_date, 
        duration_hours, booking_type, total_price, status
    ) VALUES (
        p_user_id, p_court_id, p_time_slot_id, p_booking_date,
        p_duration_hours, p_booking_type, p_total_price, 'confirmed'
    );
    
    -- Update court status to occupied
    UPDATE courts SET status = 'occupied' WHERE id = p_court_id;
    
    COMMIT;
    
    SELECT TRUE AS success, 'Booking created successfully' AS message, LAST_INSERT_ID() AS booking_id;
END //
DELIMITER ;

-- Procedure to calculate booking price
DELIMITER //
CREATE PROCEDURE CalculateBookingPrice(
    IN p_court_id INT,
    IN p_time_slot_id INT,
    IN p_duration_hours DECIMAL(4,2),
    IN p_booking_type VARCHAR(20),
    IN p_equipment_ids TEXT -- comma-separated equipment IDs
)
BEGIN
    DECLARE v_base_price DECIMAL(10,2);
    DECLARE v_hourly_rate DECIMAL(10,2);
    DECLARE v_is_peak BOOLEAN;
    DECLARE v_equipment_total DECIMAL(10,2) DEFAULT 0;
    DECLARE v_final_price DECIMAL(10,2);
    DECLARE v_equipment_id INT;
    DECLARE v_quantity INT DEFAULT 1;
    DECLARE v_done INT DEFAULT 0;
    DECLARE equipment_cursor CURSOR FOR 
        SELECT CAST(TRIM(value) AS UNSIGNED) 
        FROM STRING_SPLIT(p_equipment_ids, ',');
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;
    
    -- Get court hourly rate
    SELECT hourly_rate INTO v_hourly_rate FROM courts WHERE id = p_court_id;
    
    -- Check if peak hour
    SELECT is_peak_hour INTO v_is_peak FROM time_slots WHERE id = p_time_slot_id;
    
    -- Calculate base price
    IF p_booking_type = 'play_all' THEN
        -- For play-all-you-can, use fixed rate
        SELECT price INTO v_base_price 
        FROM pricing 
        WHERE rate_type = 'play_all' 
          AND is_active = TRUE 
        ORDER BY price LIMIT 1;
    ELSE
        -- For hourly, calculate based on duration
        SET v_base_price = v_hourly_rate * p_duration_hours;
        
        -- Apply peak hour surcharge (20%)
        IF v_is_peak THEN
            SET v_base_price = v_base_price * 1.2;
        END IF;
    END IF;
    
    -- Calculate equipment rental if provided
    IF p_equipment_ids IS NOT NULL AND p_equipment_ids != '' THEN
        OPEN equipment_cursor;
        
        equipment_loop: LOOP
            FETCH equipment_cursor INTO v_equipment_id;
            IF v_done THEN
                LEAVE equipment_loop;
            END IF;
            
            -- Get equipment price (assuming quantity 1 for each)
            SELECT rental_price INTO @equip_price 
            FROM equipment 
            WHERE id = v_equipment_id;
            
            SET v_equipment_total = v_equipment_total + @equip_price;
        END LOOP;
        
        CLOSE equipment_cursor;
    END IF;
    
    -- Calculate final price
    SET v_final_price = v_base_price + v_equipment_total;
    
    -- Return the breakdown
    SELECT 
        v_base_price AS base_price,
        v_equipment_total AS equipment_total,
        v_final_price AS final_price,
        v_hourly_rate AS hourly_rate,
        v_is_peak AS is_peak_hour;
END //
DELIMITER ;

-- ============================================
-- CREATE VIEWS
-- ============================================

-- View for active bookings
CREATE VIEW vw_active_bookings AS
SELECT 
    b.id AS booking_id,
    u.full_name AS customer_name,
    u.email AS customer_email,
    u.phone AS customer_phone,
    c.court_name,
    c.court_number,
    ts.slot_name,
    ts.start_time,
    ts.end_time,
    b.booking_date,
    b.duration_hours,
    b.total_price,
    b.booking_type,
    b.status,
    b.payment_status,
    b.created_at
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN courts c ON b.court_id = c.id
JOIN time_slots ts ON b.time_slot_id = ts.id
WHERE b.status IN ('confirmed', 'pending')
ORDER BY b.booking_date DESC, ts.start_time;

-- View for court availability
CREATE VIEW vw_court_availability AS
SELECT 
    c.id AS court_id,
    c.court_number,
    c.court_name,
    c.status AS court_status,
    c.hourly_rate,
    ts.id AS time_slot_id,
    ts.slot_name,
    ts.start_time,
    ts.end_time,
    ts.is_peak_hour,
    CURDATE() AS check_date,
    CASE 
        WHEN b.id IS NOT NULL AND b.status IN ('confirmed', 'pending') THEN 'booked'
        WHEN c.status = 'maintenance' THEN 'maintenance'
        ELSE 'available'
    END AS availability_status,
    b.id AS booking_id,
    u.full_name AS booked_by
FROM courts c
CROSS JOIN time_slots ts
LEFT JOIN bookings b ON c.id = b.court_id 
    AND b.booking_date = CURDATE() 
    AND ts.id = b.time_slot_id
    AND b.status IN ('confirmed', 'pending')
LEFT JOIN users u ON b.user_id = u.id
ORDER BY c.court_number, ts.start_time;

-- View for daily revenue
CREATE VIEW vw_daily_revenue AS
SELECT 
    DATE(payment_date) AS revenue_date,
    COUNT(*) AS total_transactions,
    SUM(amount) AS total_revenue,
    AVG(amount) AS average_transaction,
    payment_method,
    status AS payment_status
FROM payments
WHERE status = 'success'
GROUP BY DATE(payment_date), payment_method, status
ORDER BY revenue_date DESC;

-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Trigger to log booking creation
DELIMITER //
CREATE TRIGGER trg_after_booking_insert
AFTER INSERT ON bookings
FOR EACH ROW
BEGIN
    INSERT INTO activity_log (user_id, activity_type, description)
    VALUES (
        NEW.user_id,
        'booking_created',
        CONCAT('Booking #', NEW.id, ' created for Court ', 
               (SELECT court_number FROM courts WHERE id = NEW.court_id),
               ' on ', NEW.booking_date)
    );
END //
DELIMITER ;

-- Trigger to update court status after booking completion
DELIMITER //
CREATE TRIGGER trg_after_booking_update
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        UPDATE courts SET status = 'available' WHERE id = NEW.court_id;
        
        INSERT INTO activity_log (user_id, activity_type, description)
        VALUES (
            NEW.user_id,
            'booking_completed',
            CONCAT('Booking #', NEW.id, ' completed for Court ', 
                   (SELECT court_number FROM courts WHERE id = NEW.court_id))
        );
    END IF;
END //
DELIMITER ;

-- Trigger to validate booking date (cannot book past dates)
DELIMITER //
CREATE TRIGGER trg_before_booking_insert
BEFORE INSERT ON bookings
FOR EACH ROW
BEGIN
    IF NEW.booking_date < CURDATE() THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Cannot book for past dates';
    END IF;
END //
DELIMITER ;

-- ============================================
-- CREATE INDEXES FOR OPTIMIZATION
-- ============================================

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_court ON bookings(court_id);
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_equipment_type_price ON equipment(equipment_type, rental_price);

-- ============================================
-- GRANT PERMISSIONS (Adjust as needed)
-- ============================================

-- Create database user (optional)
-- CREATE USER 'kpbc_user'@'localhost' IDENTIFIED BY 'secure_password';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON kpbc_db.* TO 'kpbc_user'@'localhost';
-- GRANT EXECUTE ON PROCEDURE kpbc_db.* TO 'kpbc_user'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================
-- FINAL SETUP MESSAGE
-- ============================================

SELECT '✅ DATABASE SETUP COMPLETED SUCCESSFULLY!' AS message;
SELECT '📊 Database: kpbc_db' AS info;
SELECT CONCAT('📋 Total tables created: ', COUNT(*)) AS info 
FROM information_schema.tables 
WHERE table_schema = 'kpbc_db';

SELECT '👤 Test Admin Login:' AS info;
SELECT username, email, role FROM admins;

SELECT '🎾 Courts Available:' AS info;
SELECT COUNT(*) as total_courts, 
       SUM(CASE WHEN status = 'available' THEN 1 ELSE 0 END) as available_courts,
       SUM(CASE WHEN status = 'maintenance' THEN 1 ELSE 0 END) as maintenance_courts
FROM courts;