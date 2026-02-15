<?php
// user_reset_password.php
include 'db_connect.php';

$token = $_GET['token'] ?? '';
$email = $_GET['email'] ?? '';
$message = '';
$showForm = false;

if ($token && $email) {
    $stmt = $conn->prepare("SELECT id FROM users WHERE email = ? AND reset_token = ? AND reset_expires > NOW()");
    $stmt->bind_param("ss", $email, $token);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $showForm = true;
    } else {
        $message = "Invalid or expired link. Please request a new one.";
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $new_pass = password_hash($_POST['password'], PASSWORD_DEFAULT);
    $u_email = $_POST['email'];
    $u_token = $_POST['token'];

    $update = $conn->prepare("UPDATE users SET password = ?, reset_token = NULL, reset_expires = NULL WHERE email = ? AND reset_token = ?");
    $update->bind_param("sss", $new_pass, $u_email, $u_token);
    
    if ($update->execute()) {
        $message = "Password updated! You can now login to your account.";
        $showForm = false;
    }
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Reset Your Password</title>
    <style>
        body { font-family: 'Inter', sans-serif; background: #f3f4f6; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
        .reset-box { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 350px; }
        input { width: 100%; padding: 12px; margin: 10px 0; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
        button { width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
        .msg { color: #059669; background: #ecfdf5; padding: 10px; border-radius: 4px; text-align: center; }
    </style>
</head>
<body>
    <div class="reset-box">
        <h3>Reset Password</h3>
        <?php if($message) echo "<div class='msg'>$message</div>"; ?>
        <?php if($showForm): ?>
        <form method="POST">
            <input type="hidden" name="token" value="<?= htmlspecialchars($token) ?>">
            <input type="hidden" name="email" value="<?= htmlspecialchars($email) ?>">
            <input type="password" name="password" placeholder="New Password" required minlength="6">
            <button type="submit">Update Password</button>
        </form>
        <?php endif; ?>
    </div>
</body>
</html>