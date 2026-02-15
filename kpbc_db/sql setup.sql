-- ============================================
-- KATIPUNAN PRIME BADMINTON CENTER
-- COMPLETE DATABASE SETUP - FULL WORKING VERSION
-- ============================================

-- 1. CREATE AND SELECT DATABASE
DROP DATABASE IF EXISTS kpbc_db;
CREATE DATABASE kpbc_db;
USE kpbc_db;

-- ============================================
-- 2. CREATE TABLES (SIMPLIFIED, PRODUCTION-READY)
-- ============================================

-- USERS TABLE (for customer registration/login)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255) NULL,
    reset_expires DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_reset (reset_token)
);

-- BOOKINGS TABLE (MAIN TABLE - matches booking-page.js exactly)
CREATE TABLE bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(100) NOT NULL,
    user_email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    court_number VARCHAR(10) NOT NULL,
    booking_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    rate_type VARCHAR(50) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (user_email),
    INDEX idx_date (booking_date),
    INDEX idx_status (status),
    INDEX idx_court_date (court_number, booking_date)
);

-- COURTS TABLE
CREATE TABLE courts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    court_number INT UNIQUE NOT NULL,
    court_name VARCHAR(50) NOT NULL,
    status ENUM('available', 'occupied', 'maintenance') DEFAULT 'available',
    hourly_rate DECIMAL(10,2) NOT NULL DEFAULT 170.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TIME_SLOTS TABLE
CREATE TABLE time_slots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    slot_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_peak_hour BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EQUIPMENT TABLE
CREATE TABLE equipment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    equipment_name VARCHAR(100) NOT NULL,
    equipment_type ENUM('racket', 'shuttlecock', 'shoes', 'water', 'towel', 'other') NOT NULL,
    rental_price DECIMAL(10,2) NOT NULL,
    quantity_available INT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BOOKING_EQUIPMENT TABLE
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

-- ADMINS TABLE
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
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================
-- 3. INSERT DEFAULT DATA
-- ============================================

-- INSERT COURTS (10 courts)
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
(10, 'Court 10 - Premium', 'available', 180.00);

-- INSERT TIME SLOTS (2-hour sessions)
INSERT INTO time_slots (slot_name, start_time, end_time, is_peak_hour) VALUES
('06:00-08:00', '06:00:00', '08:00:00', FALSE),
('08:00-10:00', '08:00:00', '10:00:00', FALSE),
('10:00-12:00', '10:00:00', '12:00:00', FALSE),
('12:00-14:00', '12:00:00', '14:00:00', FALSE),
('14:00-16:00', '14:00:00', '16:00:00', FALSE),
('16:00-18:00', '16:00:00', '18:00:00', TRUE),  -- PEAK
('18:00-20:00', '18:00:00', '20:00:00', TRUE),  -- PEAK
('20:00-22:00', '20:00:00', '22:00:00', TRUE);  -- PEAK

-- INSERT EQUIPMENT
INSERT INTO equipment (equipment_name, equipment_type, rental_price, quantity_available, description) VALUES
('Yonex Racket', 'racket', 50.00, 20, 'Premium Yonex badminton racket'),
('Shuttlecock', 'shuttlecock', 30.00, 100, 'Tube of 12 shuttlecocks'),
('Badminton Shoes', 'shoes', 80.00, 15, 'Court shoes rental'),
('Water Bottle', 'water', 15.00, 50, '500ml bottled water'),
('Premium Towel', 'towel', 20.00, 30, 'Sports towel');

-- INSERT ADMIN USERS
-- Passwords: 
-- admin@kpbc.com / Admin24258 (bcrypt hash)
INSERT INTO admins (username, email, password, full_name, role, is_active) VALUES
('admin', 'admin@kpbc.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator', 'super_admin', TRUE);

-- INSERT SAMPLE USERS (for testing)
-- Passwords: all 'test123' (bcrypt hash)
INSERT INTO users (full_name, email, phone, password, created_at) VALUES
('Juan Dela Cruz', 'juan@example.com', '0917-123-4567', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW()),
('Maria Santos', 'maria@example.com', '0918-987-6543', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW()),
('Pedro Reyes', 'pedro@example.com', '0920-555-1212', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW()),
('Ana Lopez', 'ana@example.com', '0919-444-3333', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW()),
('James Castro', 'jamescastrol23@gmail.com', '0905-613-9193', '$2y$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', NOW());

-- INSERT SAMPLE BOOKINGS
INSERT INTO bookings (customer_name, user_email, phone, court_number, booking_date, time_slot, rate_type, total_amount, payment_method, status, created_at) VALUES
('Juan Dela Cruz', 'juan@example.com', '0917-123-4567', '1', CURDATE() + INTERVAL 1 DAY, '06:00-08:00', 'Standard', 500.00, 'GCash', 'confirmed', NOW()),
('Maria Santos', 'maria@example.com', '0918-987-6543', '2', CURDATE() + INTERVAL 2 DAY, '08:00-10:00', 'Premium', 750.00, 'Cash', 'pending', NOW()),
('Pedro Reyes', 'pedro@example.com', '0920-555-1212', '3', CURDATE() + INTERVAL 3 DAY, '10:00-12:00', 'Standard', 500.00, 'Credit Card', 'cancelled', NOW()),
('Ana Lopez', 'ana@example.com', '0919-444-3333', '4', CURDATE() + INTERVAL 4 DAY, '14:00-16:00', 'Standard', 500.00, 'Bank Transfer', 'confirmed', NOW()),
('James Castro', 'jamescastrol23@gmail.com', '0905-613-9193', '1', CURDATE() + INTERVAL 5 DAY, '18:00-20:00', 'Premium', 750.00, 'GCash', 'pending', NOW());

-- INSERT BOOKING WITH EQUIPMENT (sample)
INSERT INTO bookings (customer_name, user_email, phone, court_number, booking_date, time_slot, rate_type, total_amount, payment_method, status, created_at) VALUES
('James Castro', 'jamescastrol23@gmail.com', '0905-613-9193', '2', CURDATE() + INTERVAL 6 DAY, '16:00-18:00', 'Hourly', 515.00, 'GCash', 'confirmed', NOW());

SET @last_booking_id = LAST_INSERT_ID();

-- Add equipment for that booking
INSERT INTO booking_equipment (booking_id, equipment_id, quantity, subtotal) VALUES
(@last_booking_id, 1, 2, 100.00),  -- 2 rackets
(@last_booking_id, 2, 2, 60.00),   -- 2 shuttlecocks
(@last_booking_id, 4, 1, 15.00);   -- 1 water

-- ============================================
-- 4. CREATE USEFUL VIEWS
-- ============================================

-- View: All bookings with customer info
CREATE VIEW vw_bookings_full AS
SELECT 
    b.id,
    b.customer_name,
    b.user_email,
    b.phone,
    b.court_number,
    b.booking_date,
    b.time_slot,
    b.rate_type,
    b.total_amount,
    b.payment_method,
    b.status,
    b.created_at,
    CASE 
        WHEN b.status = 'confirmed' THEN '#10b981'
        WHEN b.status = 'pending' THEN '#f59e0b'
        WHEN b.status = 'cancelled' THEN '#ef4444'
        ELSE '#64748b'
    END AS status_color,
    DATE_FORMAT(b.booking_date, '%M %d, %Y') AS formatted_date
FROM bookings b
ORDER BY b.booking_date DESC, b.time_slot ASC;

-- View: Daily booking statistics
CREATE VIEW vw_daily_stats AS
SELECT 
    booking_date,
    COUNT(*) AS total_bookings,
    SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
    SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
    SUM(total_amount) AS daily_revenue
FROM bookings
GROUP BY booking_date
ORDER BY booking_date DESC;

-- View: Court availability summary
CREATE VIEW vw_court_availability AS
SELECT 
    c.court_number,
    c.court_name,
    c.status AS court_status,
    COUNT(b.id) AS active_bookings,
    MIN(b.booking_date) AS next_booking_date
FROM courts c
LEFT JOIN bookings b ON c.court_number = b.court_number 
    AND b.booking_date >= CURDATE() 
    AND b.status IN ('confirmed', 'pending')
GROUP BY c.court_number, c.court_name, c.status
ORDER BY c.court_number;

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX idx_bookings_user_email ON bookings(user_email);
CREATE INDEX idx_bookings_date_status ON bookings(booking_date, status);
CREATE INDEX idx_bookings_court_date ON bookings(court_number, booking_date);
CREATE INDEX idx_equipment_type ON equipment(equipment_type);
CREATE INDEX idx_booking_equipment_booking ON booking_equipment(booking_id);

-- ============================================
-- 6. VERIFY INSTALLATION
-- ============================================

SELECT '✅ KATIPUNAN PRIME DATABASE INSTALLED SUCCESSFULLY!' AS STATUS;
SELECT CONCAT('📊 Database: ', DATABASE()) AS INFO;
SELECT CONCAT('📋 Tables created: ', COUNT(*)) AS TABLES_COUNT 
FROM information_schema.tables 
WHERE table_schema = 'kpbc_db';

SELECT '👤 Admin Login Credentials:' AS SECTION;
SELECT email, password AS 'bcrypt_hash', role 
FROM admins;

SELECT '🎾 Courts Status:' AS SECTION;
SELECT court_number, court_name, status, hourly_rate 
FROM courts 
ORDER BY court_number;

SELECT '📅 Sample Bookings:' AS SECTION;
SELECT 
    id,
    customer_name,
    court_number,
    booking_date,
    time_slot,
    total_amount,
    status
FROM bookings 
ORDER BY created_at DESC 
LIMIT 10;

SELECT '💰 Equipment Available:' AS SECTION;
SELECT equipment_name, rental_price, quantity_available 
FROM equipment 
ORDER BY rental_price;