<?php
// setup_db.php - Run this ONCE to create database and tables
$servername = "localhost";
$username = "root";
$password = "";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Create database
$conn->query("CREATE DATABASE IF NOT EXISTS kpbc_db");
$conn->select_db("kpbc_db");

// Create bookings table
$conn->query("CREATE TABLE IF NOT EXISTS bookings (
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
)");

// Insert sample data
$conn->query("INSERT IGNORE INTO bookings (customer_name, user_email, phone, court_number, booking_date, time_slot, rate_type, total_amount, payment_method, status) VALUES
    ('Juan Dela Cruz', 'juan@example.com', '0917-123-4567', '1', '2024-02-15', '6:00 AM - 7:00 AM', 'Standard', 500, 'GCash', 'confirmed'),
    ('Maria Santos', 'maria@example.com', '0918-987-6543', '2', '2024-02-16', '7:00 AM - 8:00 AM', 'Premium', 750, 'Cash', 'pending'),
    ('Pedro Reyes', 'pedro@example.com', '0920-555-1212', '3', '2024-02-17', '8:00 AM - 9:00 AM', 'Standard', 500, 'Credit Card', 'cancelled'),
    ('Ana Lopez', 'ana@example.com', '0919-444-3333', '4', '2024-02-18', '9:00 AM - 10:00 AM', 'Standard', 500, 'Bank Transfer', 'confirmed')
");

echo "✅ Database setup complete!<br>";
echo "✅ kpbc_db database created<br>";
echo "✅ bookings table created<br>";
echo "✅ Sample data inserted<br><br>";
echo "📌 Now go to admin.html and login with:<br>";
echo "Email: admin@kpbc.com<br>";
echo "Password: Admin24258<br><br>";
echo "The admin panel should show 4 sample bookings.";
?>