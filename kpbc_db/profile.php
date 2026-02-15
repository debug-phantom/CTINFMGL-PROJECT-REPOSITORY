<?php
session_start();

// ---------- DEMO DATA (James Castro, Feb 12, 2026) ----------
if (!isset($_SESSION['currentUser'])) {
    $_SESSION['currentUser'] = [
        'id' => 1,
        'full_name' => 'James',
        'email' => 'jamescastro123@gmail.com',
        'phone' => '09056139193',
        'avatar' => '👤',
        'created_at' => '2026-02-12 00:00:00'
    ];
}

if (!isset($_SESSION['preferences'])) {
    $_SESSION['preferences'] = [
        1 => [
            'skill_level' => '',
            'preferred_court' => '',
            'notifications' => ['email' => true, 'sms' => true, 'reminders' => true]
        ]
    ];
}

if (!isset($_SESSION['bookings'])) {
    $_SESSION['bookings'] = [
        ['id' => 1, 'user_id' => 1, 'user_name' => 'James', 'time' => '8:25 PM', 'duration' => 2, 'date' => '2026-02-12']
    ];
}

$currentUser = &$_SESSION['currentUser'];
$preferences = &$_SESSION['preferences'][$currentUser['id']];
$bookings = array_filter($_SESSION['bookings'], fn($b) => $b['user_id'] == $currentUser['id']);

// ---------- HANDLE FORM SUBMISSIONS ----------
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    // Update Name
    if ($action === 'update_name' && !empty($_POST['full_name'])) {
        $currentUser['full_name'] = htmlspecialchars($_POST['full_name']);
        // Also update name in bookings
        foreach ($_SESSION['bookings'] as &$bk) {
            if ($bk['user_id'] == $currentUser['id']) $bk['user_name'] = $currentUser['full_name'];
        }
        $_SESSION['bookings'] = $_SESSION['bookings']; // re‑assign to save
    }

    // Update Phone
    if ($action === 'update_phone' && !empty($_POST['phone'])) {
        $currentUser['phone'] = htmlspecialchars($_POST['phone']);
    }

    // Update Skill Level
    if ($action === 'update_skill' && isset($_POST['skill_level'])) {
        $preferences['skill_level'] = $_POST['skill_level'];
    }

    // Update Preferred Court
    if ($action === 'update_court' && isset($_POST['preferred_court'])) {
        $preferences['preferred_court'] = $_POST['preferred_court'];
    }

    // Update Avatar
    if ($action === 'update_avatar' && isset($_POST['avatar'])) {
        $currentUser['avatar'] = $_POST['avatar'];
    }

    // Change Password (demo – no real check)
    if ($action === 'change_password') {
        $current = $_POST['current_password'] ?? '';
        $new = $_POST['new_password'] ?? '';
        $confirm = $_POST['confirm_password'] ?? '';
        if ($new && $new === $confirm && strlen($new) >= 6) {
            $_SESSION['password_message'] = 'Password updated successfully.';
        } else {
            $_SESSION['password_error'] = 'Password must be at least 6 characters and match.';
        }
    }

    // Update Notification Settings
    if ($action === 'update_notifications') {
        $preferences['notifications'] = [
            'email' => isset($_POST['email_notifications']),
            'sms' => isset($_POST['sms_notifications']),
            'reminders' => isset($_POST['booking_reminders'])
        ];
    }

    // Redirect to avoid form resubmission
    header('Location: profile.php');
    exit;
}

// ---------- STATS CALCULATION ----------
$totalBookings = count($bookings);
$hoursPlayed = 0;
$timeSlots = [];
foreach ($bookings as $bk) {
    $hoursPlayed += (int)($bk['duration'] ?? 2);
    if (!empty($bk['time'])) {
        $timePart = explode('-', $bk['time'])[0];
        $timeSlots[$timePart] = ($timeSlots[$timePart] ?? 0) + 1;
    }
}
$favoriteTime = '-';
$maxCount = 0;
foreach ($timeSlots as $time => $count) {
    if ($count > $maxCount) { $maxCount = $count; $favoriteTime = $time; }
}
$memberStatus = 'Basic';
if ($totalBookings >= 20) $memberStatus = 'Gold';
elseif ($totalBookings >= 10) $memberStatus = 'Silver';

// Helper for skill display
$skillDisplay = empty($preferences['skill_level']) ? 'Not set' : ucfirst($preferences['skill_level']);
$courtDisplay = 'Not set';
if (!empty($preferences['preferred_court'])) {
    $courtDisplay = ($preferences['preferred_court'] === 'any') ? 'Any Available' : 'Court ' . $preferences['preferred_court'];
}

// ---------- HTML OUTPUT (identical style, camera removed) ----------
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - Katipunan Prime (PHP)</title>
    <style>
        /* ------- EXACT SAME STYLES FROM YOUR ORIGINAL ------- */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --primary-color: #0066ff;
            --primary-dark: #0052cc;
            --bg-light: #ffffff;
            --bg-dark: #0f172a;
            --text-light: #1a1a1a;
            --text-dark: #e2e8f0;
            --card-light: #ffffff;
            --card-dark: #1e293b;
            --border-light: #e5e5e5;
            --border-dark: #475569;
        }
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
            background: var(--bg-light);
            color: var(--text-light);
            line-height: 1.6;
            min-height: 100vh;
            transition: all 0.3s ease;
        }
        body.dark-mode {
            background: var(--bg-dark);
            color: var(--text-dark);
        }
        .header {
            background: rgba(255, 255, 255, 0.98);
            backdrop-filter: blur(20px);
            padding: 1rem 2rem;
            border-bottom: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 2px 20px rgba(0, 0, 0, 0.04);
        }
        body.dark-mode .header {
            background: rgba(15, 23, 42, 0.95);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .header-content {
            max-width: 1400px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .logo {
            font-size: 1.8rem;
            font-weight: 800;
            color: var(--primary-color);
            cursor: pointer;
        }
        .nav-controls {
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        .btn {
            padding: 0.75rem 2rem;
            font-size: 1rem;
            font-weight: 600;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-family: 'Poppins', sans-serif;
        }
        .btn-outline {
            background: transparent;
            color: var(--primary-color);
            border: 2px solid var(--primary-color);
        }
        .btn-outline:hover {
            background: rgba(0, 102, 255, 0.1);
        }
        .theme-btn {
            background: transparent;
            border: 2px solid var(--primary-color);
            border-radius: 50%;
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-size: 1.2rem;
            transition: all 0.3s ease;
        }
        .profile-container {
            max-width: 1200px;
            margin: 2rem auto;
            padding: 0 2rem;
        }
        .profile-header {
            text-align: center;
            margin-bottom: 3rem;
        }
        .profile-header h1 {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
        }
        .profile-header p {
            color: #666;
            font-size: 1.1rem;
        }
        body.dark-mode .profile-header p {
            color: #cbd5e1;
        }
        .profile-card {
            background: var(--card-light);
            border-radius: 20px;
            padding: 3rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            margin-bottom: 2rem;
        }
        body.dark-mode .profile-card {
            background: var(--card-dark);
        }
        .profile-info {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 3rem;
            align-items: start;
        }
        @media (max-width: 768px) {
            .profile-info {
                grid-template-columns: 1fr;
                text-align: center;
            }
        }
        .avatar-section {
            text-align: center;
        }
        .avatar {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--primary-color), #00a3ff);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4rem;
            color: white;
            margin-bottom: 1rem;
            position: relative;
            overflow: hidden;
        }
        .avatar-placeholder {
            font-size: 3.5rem;
        }
        .change-avatar-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1.5rem;
            border-radius: 20px;
            font-weight: 600;
            cursor: pointer;
            margin-top: 1rem;
            transition: all 0.3s ease;
        }
        .change-avatar-btn:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
        }
        .details-section {
            flex: 1;
        }
        .details-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }
        .detail-group {
            margin-bottom: 1.5rem;
        }
        .detail-label {
            color: #666;
            font-size: 0.9rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        body.dark-mode .detail-label {
            color: #cbd5e1;
        }
        .detail-value {
            font-size: 1.1rem;
            font-weight: 600;
            padding: 0.75rem;
            background: #f8f9fa;
            border-radius: 8px;
            border: 1px solid var(--border-light);
            min-height: 50px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        body.dark-mode .detail-value {
            background: #334155;
            border-color: var(--border-dark);
        }
        .edit-btn {
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.3rem 1rem;
            border-radius: 16px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: 0.2s;
            text-decoration: none;
            display: inline-block;
        }
        .edit-btn:hover {
            background: var(--primary-dark);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-top: 2rem;
        }
        .stat-card {
            background: linear-gradient(135deg, var(--primary-color), #00a3ff);
            color: white;
            padding: 1.5rem;
            border-radius: 12px;
            text-align: center;
            transition: transform 0.3s ease;
        }
        .stat-card:hover {
            transform: translateY(-5px);
        }
        .stat-value {
            font-size: 2.5rem;
            font-weight: 900;
            margin-bottom: 0.5rem;
        }
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        .action-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            margin-top: 2rem;
            flex-wrap: wrap;
        }
        .logout-btn {
            background: #ef4444;
            color: white;
            border: none;
        }
        .logout-btn:hover {
            background: #dc2626;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }
        .message {
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 1rem;
            display: <?php echo isset($_SESSION['password_message']) || isset($_SESSION['password_error']) ? 'block' : 'none'; ?>;
        }
        .success {
            background: #d1fae5;
            color: #059669;
            border: 1px solid #6ee7b7;
        }
        .error {
            background: #fee2e2;
            color: #dc2626;
            border: 1px solid #fca5a5;
        }
        body.dark-mode .success {
            background: #065f46;
            color: #a7f3d0;
            border-color: #10b981;
        }
        body.dark-mode .error {
            background: #7f1d1d;
            color: #fecaca;
            border-color: #b91c1c;
        }
        /* Edit popup (modal-like) */
        .edit-popup {
            display: none;
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.6);
            backdrop-filter: blur(8px);
            align-items: center;
            justify-content: center;
            z-index: 2000;
        }
        .edit-popup.active {
            display: flex;
        }
        .popup-content {
            background: var(--card-light);
            border-radius: 20px;
            padding: 2.5rem;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        body.dark-mode .popup-content {
            background: var(--card-dark);
        }
        .popup-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
        }
        .popup-title {
            font-size: 1.8rem;
            font-weight: 800;
        }
        .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #666;
        }
        body.dark-mode .close-btn {
            color: #cbd5e1;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        .form-group label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 600;
        }
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 1rem;
            border: 2px solid var(--border-light);
            border-radius: 10px;
            font-size: 1rem;
        }
        body.dark-mode .form-group input,
        body.dark-mode .form-group select {
            background: #334155;
            border-color: var(--border-dark);
            color: white;
        }
        .form-actions {
            display: flex;
            gap: 1rem;
            margin-top: 2rem;
        }
        .btn-primary {
            background: var(--primary-color);
            color: white;
            border: none;
        }
        .btn-primary:hover {
            background: var(--primary-dark);
            transform: translateY(-2px);
        }
        .avatar-options {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 1rem;
            margin: 1.5rem 0;
        }
        .avatar-option {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            cursor: pointer;
            transition: 0.3s;
            border: 2px solid transparent;
        }
        .avatar-option:hover {
            transform: scale(1.1);
        }
        .avatar-option.selected {
            border-color: var(--primary-color);
            box-shadow: 0 0 0 4px rgba(0,102,255,0.1);
        }
        .reset-btn {
            background: #ffc107;
            color: #1e293b;
            border: none;
            padding: 0.5rem 1.2rem;
            border-radius: 30px;
            font-weight: 600;
            cursor: pointer;
            margin-left: 1rem;
        }
        .reset-btn:hover {
            background: #ffb300;
        }
    </style>
</head>
<body class="<?php echo isset($_COOKIE['theme']) ? $_COOKIE['theme'] : 'light-mode'; ?>">
    <header class="header">
        <div class="header-content">
            <div class="logo" onclick="window.location.href='user.html'">Katipunan Prime</div>
            <div class="nav-controls">
                <button class="theme-btn" onclick="toggleTheme()"><?php echo ($_COOKIE['theme'] ?? 'light-mode') === 'dark-mode' ? '🌙' : '☀️'; ?></button>
                <button class="btn btn-outline" onclick="window.location.href='user.html'">Back to Home</button>
                <button class="reset-btn" onclick="window.location.href='?reset=1'">🔄 Reset Demo</button>
            </div>
        </div>
    </header>

    <div class="profile-container">
        <div class="profile-header">
            <h1>My Profile</h1>
            <p>Manage your personal information and preferences</p>
        </div>

        <!-- Messages -->
        <?php if (isset($_SESSION['password_message'])): ?>
            <div class="message success"><?php echo $_SESSION['password_message']; unset($_SESSION['password_message']); ?></div>
        <?php endif; ?>
        <?php if (isset($_SESSION['password_error'])): ?>
            <div class="message error"><?php echo $_SESSION['password_error']; unset($_SESSION['password_error']); ?></div>
        <?php endif; ?>

        <div class="profile-card">
            <div class="profile-info">
                <div class="avatar-section">
                    <div class="avatar" id="user-avatar">
                        <div class="avatar-placeholder"><?php echo htmlspecialchars($currentUser['avatar'] ?? '👤'); ?></div>
                    </div>
                    <button class="change-avatar-btn" onclick="openAvatarPopup()">Change Photo</button>
                </div>

                <div class="details-section">
                    <div class="details-grid">
                        <!-- Full Name -->
                        <div class="detail-group">
                            <div class="detail-label">Full Name</div>
                            <div class="detail-value">
                                <span><?php echo htmlspecialchars($currentUser['full_name'] ?? 'Not set'); ?></span>
                                <button class="edit-btn" onclick="openEditPopup('name')">✏️ Edit</button>
                            </div>
                        </div>
                        <!-- Email (non-editable) -->
                        <div class="detail-group">
                            <div class="detail-label">Email Address</div>
                            <div class="detail-value">
                                <?php echo htmlspecialchars($currentUser['email'] ?? 'Not set'); ?>
                            </div>
                        </div>
                        <!-- Phone Number -->
                        <div class="detail-group">
                            <div class="detail-label">Phone Number</div>
                            <div class="detail-value">
                                <span><?php echo htmlspecialchars($currentUser['phone'] ?? 'Not set'); ?></span>
                                <button class="edit-btn" onclick="openEditPopup('phone')">✏️ Edit</button>
                            </div>
                        </div>
                        <!-- Member Since -->
                        <div class="detail-group">
                            <div class="detail-label">Member Since</div>
                            <div class="detail-value">
                                <?php echo date('F j, Y', strtotime($currentUser['created_at'] ?? 'now')); ?>
                            </div>
                        </div>
                        <!-- Skill Level -->
                        <div class="detail-group">
                            <div class="detail-label">Badminton Skill Level</div>
                            <div class="detail-value">
                                <span><?php echo $skillDisplay; ?></span>
                                <button class="edit-btn" onclick="openEditPopup('skill')">✏️ Edit</button>
                            </div>
                        </div>
                        <!-- Preferred Court -->
                        <div class="detail-group">
                            <div class="detail-label">Preferred Court</div>
                            <div class="detail-value">
                                <span><?php echo $courtDisplay; ?></span>
                                <button class="edit-btn" onclick="openEditPopup('court')">✏️ Edit</button>
                            </div>
                        </div>
                    </div>

                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-value"><?php echo $totalBookings; ?></div>
                            <div class="stat-label">Total Bookings</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value"><?php echo $hoursPlayed; ?></div>
                            <div class="stat-label">Hours Played</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value"><?php echo $favoriteTime; ?></div>
                            <div class="stat-label">Favorite Time</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-value"><?php echo $memberStatus; ?></div>
                            <div class="stat-label">Member Status</div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="action-buttons">
                <button class="btn btn-primary" onclick="openEditPopup('password')">Change Password</button>
                <button class="btn btn-outline" onclick="window.location.href='booking-page.html'">🏸 Book a Court</button>
                <div style="width:100%; height:1px; background:var(--border-light); margin:1rem 0;"></div>
                <button class="btn btn-outline" onclick="openEditPopup('notifications')">Notification Settings</button>
                <button class="btn logout-btn" onclick="window.location.href='?logout=1'">Logout</button>
            </div>
        </div>
    </div>

    <!-- ========== EDIT POPUPS ========== -->

    <!-- Edit Name Popup -->
    <div id="popup-name" class="edit-popup">
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Edit Name</h2>
                <button class="close-btn" onclick="closePopup('popup-name')">×</button>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="update_name">
                <div class="form-group">
                    <label for="full_name">Full Name</label>
                    <input type="text" name="full_name" id="full_name" value="<?php echo htmlspecialchars($currentUser['full_name'] ?? ''); ?>" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePopup('popup-name')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Phone Popup -->
    <div id="popup-phone" class="edit-popup">
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Edit Phone Number</h2>
                <button class="close-btn" onclick="closePopup('popup-phone')">×</button>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="update_phone">
                <div class="form-group">
                    <label for="phone">Phone Number</label>
                    <input type="tel" name="phone" id="phone" value="<?php echo htmlspecialchars($currentUser['phone'] ?? ''); ?>" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePopup('popup-phone')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Skill Popup -->
    <div id="popup-skill" class="edit-popup">
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Edit Skill Level</h2>
                <button class="close-btn" onclick="closePopup('popup-skill')">×</button>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="update_skill">
                <div class="form-group">
                    <label for="skill_level">Skill Level</label>
                    <select name="skill_level" id="skill_level">
                        <option value="beginner" <?php echo ($preferences['skill_level'] ?? '') == 'beginner' ? 'selected' : ''; ?>>Beginner</option>
                        <option value="intermediate" <?php echo ($preferences['skill_level'] ?? '') == 'intermediate' ? 'selected' : ''; ?>>Intermediate</option>
                        <option value="advanced" <?php echo ($preferences['skill_level'] ?? '') == 'advanced' ? 'selected' : ''; ?>>Advanced</option>
                        <option value="professional" <?php echo ($preferences['skill_level'] ?? '') == 'professional' ? 'selected' : ''; ?>>Professional</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePopup('popup-skill')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Edit Court Popup -->
    <div id="popup-court" class="edit-popup">
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Edit Preferred Court</h2>
                <button class="close-btn" onclick="closePopup('popup-court')">×</button>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="update_court">
                <div class="form-group">
                    <label for="preferred_court">Preferred Court</label>
                    <select name="preferred_court" id="preferred_court">
                        <option value="1" <?php echo ($preferences['preferred_court'] ?? '') == '1' ? 'selected' : ''; ?>>Court 1</option>
                        <option value="2" <?php echo ($preferences['preferred_court'] ?? '') == '2' ? 'selected' : ''; ?>>Court 2</option>
                        <option value="3" <?php echo ($preferences['preferred_court'] ?? '') == '3' ? 'selected' : ''; ?>>Court 3</option>
                        <option value="4" <?php echo ($preferences['preferred_court'] ?? '') == '4' ? 'selected' : ''; ?>>Court 4</option>
                        <option value="5" <?php echo ($preferences['preferred_court'] ?? '') == '5' ? 'selected' : ''; ?>>Court 5</option>
                        <option value="6" <?php echo ($preferences['preferred_court'] ?? '') == '6' ? 'selected' : ''; ?>>Court 6</option>
                        <option value="7" <?php echo ($preferences['preferred_court'] ?? '') == '7' ? 'selected' : ''; ?>>Court 7</option>
                        <option value="8" <?php echo ($preferences['preferred_court'] ?? '') == '8' ? 'selected' : ''; ?>>Court 8</option>
                        <option value="9" <?php echo ($preferences['preferred_court'] ?? '') == '9' ? 'selected' : ''; ?>>Court 9</option>
                        <option value="10" <?php echo ($preferences['preferred_court'] ?? '') == '10' ? 'selected' : ''; ?>>Court 10</option>
                        <option value="any" <?php echo ($preferences['preferred_court'] ?? '') == 'any' ? 'selected' : ''; ?>>Any Available</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePopup('popup-court')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Change Password Popup -->
    <div id="popup-password" class="edit-popup">
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Change Password</h2>
                <button class="close-btn" onclick="closePopup('popup-password')">×</button>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="change_password">
                <div class="form-group">
                    <label for="current_password">Current Password</label>
                    <input type="password" name="current_password" id="current_password" required>
                </div>
                <div class="form-group">
                    <label for="new_password">New Password</label>
                    <input type="password" name="new_password" id="new_password" required>
                </div>
                <div class="form-group">
                    <label for="confirm_password">Confirm New Password</label>
                    <input type="password" name="confirm_password" id="confirm_password" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePopup('popup-password')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Update Password</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Notification Settings Popup -->
    <div id="popup-notifications" class="edit-popup">
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Notification Settings</h2>
                <button class="close-btn" onclick="closePopup('popup-notifications')">×</button>
            </div>
            <form method="POST">
                <input type="hidden" name="action" value="update_notifications">
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="email_notifications" <?php echo ($preferences['notifications']['email'] ?? true) ? 'checked' : ''; ?>>
                        Email Notifications
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="sms_notifications" <?php echo ($preferences['notifications']['sms'] ?? true) ? 'checked' : ''; ?>>
                        SMS Notifications
                    </label>
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" name="booking_reminders" <?php echo ($preferences['notifications']['reminders'] ?? true) ? 'checked' : ''; ?>>
                        Booking Reminders
                    </label>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePopup('popup-notifications')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Settings</button>
                </div>
            </form>
        </div>
    </div>

    <!-- Avatar Popup -->
    <div id="popup-avatar" class="edit-popup">
        <div class="popup-content">
            <div class="popup-header">
                <h2 class="popup-title">Choose Avatar</h2>
                <button class="close-btn" onclick="closePopup('popup-avatar')">×</button>
            </div>
            <form method="POST" id="avatar-form">
                <input type="hidden" name="action" value="update_avatar">
                <input type="hidden" name="avatar" id="selected-avatar" value="<?php echo htmlspecialchars($currentUser['avatar'] ?? '👤'); ?>">
                <div class="avatar-options">
                    <?php 
                    $avatars = ['👤','👨','👩','🧑‍💼','👨‍🎓','👩‍🎓','👨‍💻','👩‍💻','👨‍🏫','👩‍🏫','🧘‍♂️','🧘‍♀️'];
                    foreach ($avatars as $av):
                    ?>
                    <div class="avatar-option <?php echo ($currentUser['avatar'] ?? '👤') === $av ? 'selected' : ''; ?>" onclick="selectAvatar('<?php echo $av; ?>', this)"><?php echo $av; ?></div>
                    <?php endforeach; ?>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="closePopup('popup-avatar')">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save Avatar</button>
                </div>
            </form>
        </div>
    </div>

    <script>
        // ---------- POPUP CONTROLS ----------
        function openEditPopup(type) {
            closeAllPopups();
            document.getElementById('popup-' + type).classList.add('active');
        }
        function openAvatarPopup() {
            closeAllPopups();
            document.getElementById('popup-avatar').classList.add('active');
        }
        function closePopup(id) {
            document.getElementById(id).classList.remove('active');
        }
        function closeAllPopups() {
            document.querySelectorAll('.edit-popup').forEach(p => p.classList.remove('active'));
        }

        // ---------- AVATAR SELECTION ----------
        function selectAvatar(avatar, element) {
            document.getElementById('selected-avatar').value = avatar;
            document.querySelectorAll('.avatar-option').forEach(opt => opt.classList.remove('selected'));
            element.classList.add('selected');
        }

        // ---------- THEME TOGGLE (cookie based) ----------
        function toggleTheme() {
            let body = document.body;
            if (body.classList.contains('light-mode')) {
                body.classList.remove('light-mode');
                body.classList.add('dark-mode');
                document.cookie = "theme=dark-mode; path=/";
            } else {
                body.classList.remove('dark-mode');
                body.classList.add('light-mode');
                document.cookie = "theme=light-mode; path=/";
            }
            location.reload(); // refresh to update theme button icon
        }

        // ---------- RESET DEMO ----------
        <?php if (isset($_GET['reset'])): ?>
            session_destroy();
            session_start();
            $_SESSION = [];
            header('Location: profile.php');
            exit;
        <?php endif; ?>

        // ---------- LOGOUT ----------
        <?php if (isset($_GET['logout'])): ?>
            session_destroy();
            header('Location: user.html');
            exit;
        <?php endif; ?>
    </script>
</body>
</html>
<?php
// Clear any leftover session messages
unset($_SESSION['password_message'], $_SESSION['password_error']);
?>