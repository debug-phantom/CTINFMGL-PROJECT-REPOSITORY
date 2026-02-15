/**
 * user_auth.js
 * Handles User Login and Forgot Password Requests
 */

// --- LOGIN FORM HANDLER ---
document.getElementById('userLoginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const messageDiv = document.getElementById('loginMessage');

    // Clear previous messages
    if (messageDiv) messageDiv.style.display = 'none';

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.isOk) {
            // Save user session (localStorage is used for demo – use HttpOnly cookies in production!)
            localStorage.setItem('user', JSON.stringify(data.user));
            alert('Login Successful!');
            window.location.href = 'index.html'; // or user dashboard
        } else {
            if (messageDiv) {
                messageDiv.textContent = data.message || 'Invalid email or password.';
                messageDiv.style.display = 'block';
            } else {
                alert(data.message || 'Invalid credentials');
            }
        }
    } catch (error) {
        console.error('Login error:', error);
        if (messageDiv) {
            messageDiv.textContent = 'An error occurred. Please try again.';
            messageDiv.style.display = 'block';
        } else {
            alert('An error occurred. Please try again.');
        }
    }
});

// --- FORGOT PASSWORD HANDLER ---
async function handleUserForgot() {
    const email = prompt("Enter the email address associated with your account:");

    if (!email) return;

    // Basic email format check
    if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        const response = await fetch('user_forgot_handler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email })
        });

        const result = await response.json();

        if (result.isOk) {
            // ⚠️ For local testing only – remove debug_link in production!
            alert("Success! A reset link has been generated for testing:\n\n" + result.debug_link);
            console.log("Reset Link:", result.debug_link);
        } else {
            alert(result.message || 'Unable to process request. Please try again.');
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        alert('Failed to process request. Check your connection.');
    }
}