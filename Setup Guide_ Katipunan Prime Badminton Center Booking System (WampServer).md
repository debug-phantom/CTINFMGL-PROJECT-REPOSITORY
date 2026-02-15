Setup Guide: Katipunan Prime Badminton Center Booking System (WampServer)
This guide helps you install and run the complete booking system on your local machine using WampServer.

✅ Prerequisites
WampServer installed and running (Apache + MySQL + PHP)

A modern web browser (Chrome, Firefox, Edge)

Basic familiarity with phpMyAdmin (optional)

PHP 7.4+ (included in WampServer)

📁 Step 1: Place the Files
Create a folder inside your WampServer's www directory, e.g. C:\wamp64\www\kpbc

Copy all provided files into that folder. Ensure the following files are present:

admin.html, admin.css, admin.js

booking-page.html, booking-page.js, booking.css

user.html, user.css, user.js

rates-page.html

profile.php

login.php, register.php

save_booking.php, admin_get_bookings.php, admin_update_booking.php

db_connect.php

sql setup.sql (or database query.sql)

🚀 Step 2: Start WampServer
Launch WampServer.

Wait until the icon in the system tray turns green.

Confirm Apache and MySQL services are running.

🗄️ Step 3: Create the Database
We recommend using the full database query.sql file for a complete setup.

Using phpMyAdmin:
Go to http://localhost/phpmyadmin

Click the Import tab.

Choose the file database query.sql from your kpbc folder.

Click Go at the bottom.

Using Command Line (MySQL):
bash
Copy
Download
mysql -u root -p < "C:\wamp64\www\kpbc\database query.sql"
(Password is blank by default – press Enter.)

The script will:

Drop any existing kpbc_db

Create a fresh kpbc_db with all tables, indexes, sample data, and admin account

🔧 Step 4: Configure Database Connection
Open db_connect.php and confirm the credentials:

php
Copy
Download
$servername = "localhost";
$username   = "root";
$password   = "";
$dbname     = "kpbc_db";
These are the default WampServer credentials. Change if needed.

Important: In save_booking.php, comment out the lines that drop and recreate the bookings table after the first successful import to preserve the full database structure:

php
Copy
Download
// $conn->query("DROP TABLE IF EXISTS bookings");
// $conn->query("CREATE TABLE ...");
🌐 Step 5: Access the Application
Open your browser and go to:

Page	URL
User Home	http://localhost/kpbc/user.html
Admin Dashboard	http://localhost/kpbc/admin.html
Booking Page	http://localhost/kpbc/booking-page.html
Rates Page	http://localhost/kpbc/rates-page.html
User Profile (demo)	http://localhost/kpbc/profile.php
🔐 Step 6: Default Login Credentials
Admin Panel
Email: admin@kpbc.com

Password: Admin24258

Sample User Accounts (from sample data)
Full Name	Email	Phone	Password
Juan Dela Cruz	juan@example.com	0917-123-4567	test123
Maria Santos	maria@example.com	0918-987-6543	test123
Pedro Reyes	pedro@example.com	0920-555-1212	test123
Ana Lopez	ana@example.com	0919-444-3333	test123
James Castro	jamescastrol23@gmail.com	0905-613-9193	test123
You can also register new users via the Sign Up button on the user page.

🧪 Step 7: Test the System
User side: Log in with any user, book a court, and verify the booking appears in the admin dashboard.

Admin side: Log in, view statistics, and manage bookings (confirm, cancel, delete). Click the clock icon to view a user’s full history.

Theme toggle: Works on both user and admin pages; preference saved in localStorage.

Forgot password: Available on login modal (currently shows a debug link; replace with real email sender in production).

🛠 Troubleshooting
Problem	Possible Solution
Blank page / PHP errors	Enable error display: add error_reporting(E_ALL); ini_set('display_errors',1); at top of PHP files.
Database connection failed	Ensure MySQL is running in WampServer and kpbc_db exists. Run setup_db.php once if needed.
No bookings showing	Check save_booking.php returns JSON. Verify bookings table structure.
Admin actions not reflected	Ensure admin_update_booking.php exists. Check browser console for errors.
404 errors	Verify all files are in the same folder and URLs are correct.
Theme not persisting	This uses localStorage – works in all modern browsers.
📦 Additional Notes
This system is for local development/demonstration.

For production, implement HTTPS, secure passwords, real email sending, and remove debug code.

booking-process.php and save_booking_db.php are redundant – you can delete them.

profile.php is a demo using PHP sessions and does not connect to the database.

✅ Your system is now ready! Enjoy using the Katipunan Prime Badminton Center Booking System.


