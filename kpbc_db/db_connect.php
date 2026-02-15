<?php
// db_connect.php - Database connection file
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "kpbc_db";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // Don't die, just return error
    $conn = null;
}
?>