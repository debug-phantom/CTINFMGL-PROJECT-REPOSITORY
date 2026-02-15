let currentUser = null;

// --- 1. THEME LOGIC ---
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.onclick = () => {
            const currentTheme = document.body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeIcon(newTheme);
        };
    }
}

function updateThemeIcon(theme) {
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
        themeBtn.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
}

// --- 2. SESSION SYNC ---
function syncUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
}

function updateUIForLoggedInUser() {
    const navGuest = document.querySelector('.nav-guest');
    const navUser = document.querySelector('.nav-user');
    const navBookings = document.querySelector('.nav-bookings');
    const userDisplayName = document.getElementById('user-display-name');

    if (navGuest) navGuest.classList.add('hidden');
    if (navUser) navUser.classList.remove('hidden');
    if (navBookings) navBookings.classList.remove('hidden');
    
    if (userDisplayName && currentUser) {
        const firstName = currentUser.full_name.split(' ')[0];
        userDisplayName.textContent = `Hi, ${firstName}`;
    }
}

// --- 3. AUTHENTICATION ---
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorEl = document.getElementById('login-error');

    try {
        const response = await fetch('login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const result = await response.json();

        if (result.isOk) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            currentUser = result.user;
            updateUIForLoggedInUser();
            closeAuthModal();
        } else {
            errorEl.textContent = result.message;
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        errorEl.textContent = 'Server connection failed.';
        errorEl.classList.remove('hidden');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const errorEl = document.getElementById('signup-error');

    try {
        const response = await fetch('register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                full_name: name, 
                email, 
                phone, 
                password 
            })
        });
        const result = await response.json();

        if (result.isOk) {
            localStorage.setItem('currentUser', JSON.stringify(result.user));
            currentUser = result.user;
            updateUIForLoggedInUser();
            closeAuthModal();
        } else {
            errorEl.textContent = result.message;
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        errorEl.textContent = 'Server connection failed.';
        errorEl.classList.remove('hidden');
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'user.html';
}

// --- 4. NAVIGATION & MODALS ---
function openAuthModal(type = 'login') {
    document.getElementById('auth-modal').classList.add('active');
    
    // Clear any previous errors
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('signup-error').classList.add('hidden');
    
    if (type === 'signup') {
        switchToSignup();
    } else {
        switchToLogin();
    }
}

function closeAuthModal() {
    document.getElementById('auth-modal').classList.remove('active');
}

function switchToSignup() {
    document.getElementById('login-form-container').classList.add('hidden');
    document.getElementById('signup-form-container').classList.remove('hidden');
}

function switchToLogin() {
    document.getElementById('signup-form-container').classList.add('hidden');
    document.getElementById('login-form-container').classList.remove('hidden');
}

function redirectToBooking() {
    if (currentUser) {
        window.location.href = 'booking.html';
    } else {
        openAuthModal('login');
    }
}

// --- 5. INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    syncUserSession();

    // Attach form submission handlers
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);
    
    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    // Add click handlers for "Book Now" buttons
    document.querySelectorAll('button[onclick*="redirectToBooking"]').forEach(btn => {
        btn.onclick = redirectToBooking;
    });
});