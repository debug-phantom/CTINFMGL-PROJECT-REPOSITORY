
let allRecords = [];
let refreshInterval;

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin Dashboard Loading...');
    
    // Check if logged in
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        showDashboard();
    } else {
        showLogin();
    }
    
    // Set theme
    const savedTheme = localStorage.getItem('admin-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    // Auto-check for data every 30 seconds
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        refreshInterval = setInterval(fetchBookingsFromDB, 30000);
    }
});

// ===== NAVIGATION BRIDGE TO USER HISTORY =====
function viewUserHistory(email) {
    if (!email || email === 'undefined') {
        showToast('No email associated with this user', 'error');
        return;
    }
    localStorage.setItem('user_history_email', email);
    window.location.href = 'user-history.html';
}

// ===== THEME FUNCTIONS =====
function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('admin-theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const sun = document.querySelector('.sun-icon');
    const moon = document.querySelector('.moon-icon');
    if (sun && moon) {
        // Dark mode: moon visible, sun hidden
        // Light mode: sun visible, moon hidden
        sun.style.display = theme === 'dark' ? 'none' : 'block';
        moon.style.display = theme === 'dark' ? 'block' : 'none';
    }
}

// ===== LOGIN FUNCTIONS =====
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('admin-email').value;
    const password = document.getElementById('admin-password').value;
    const errorEl = document.getElementById('login-error');
    const loginBtn = document.getElementById('login-btn');
    
    const originalText = loginBtn.textContent;
    loginBtn.innerHTML = '<span class="loading-spinner"></span> Logging in...';
    loginBtn.disabled = true;
    errorEl.classList.add('hidden');
    
    setTimeout(() => {
        if (email === 'admin@kpbc.com' && password === 'Admin24258') {
            localStorage.setItem('adminLoggedIn', 'true');
            showDashboard();
            showToast('✅ Login successful!', 'success');
        } else {
            errorEl.textContent = 'Invalid credentials. Use: admin@kpbc.com / Admin24258';
            errorEl.classList.remove('hidden');
            loginBtn.textContent = originalText;
            loginBtn.disabled = false;
        }
    }, 500);
}

function showDashboard() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('admin-dashboard').classList.remove('hidden');
    fetchBookingsFromDB();
    
    clearInterval(refreshInterval);
    refreshInterval = setInterval(fetchBookingsFromDB, 30000);
}

function showLogin() {
    document.getElementById('login-screen').classList.remove('hidden');
    document.getElementById('admin-dashboard').classList.add('hidden');
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('adminLoggedIn');
        clearInterval(refreshInterval);
        showToast('Logged out successfully', 'success');
        showLogin();
    }
}

// ===== DATA FUNCTIONS =====
async function fetchBookingsFromDB() {
    try {
        console.log('Fetching bookings...');
        const response = await fetch('admin_get_bookings.php');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('Raw response:', text.substring(0, 200));
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error('JSON parse error:', e);
            data = { isOk: true, bookings: getFallbackData() };
        }
        
        if (data.isOk) {
            allRecords = data.bookings || [];
            updateStatistics(allRecords);
            renderBookingsTable(allRecords);
            console.log(`Loaded ${allRecords.length} bookings`);
        } else {
            throw new Error(data.message || 'Server error');
        }
        
    } catch (error) {
        console.error('Fetch error:', error);
        allRecords = getFallbackData();
        updateStatistics(allRecords);
        renderBookingsTable(allRecords);
        showToast('⚠️ Using demo data. Check PHP files.', 'error');
    }
}

function getFallbackData() {
    return [
        {
            id: 1001,
            customer_name: 'Juan Dela Cruz',
            user_email: 'juan@example.com',
            phone: '0917-123-4567',
            court_number: '1',
            booking_date: '2024-02-15',
            time_slot: '6:00 AM - 7:00 AM',
            rate_type: 'Standard',
            total_amount: 500,
            payment_method: 'GCash',
            status: 'confirmed'
        },
        {
            id: 1002,
            customer_name: 'Maria Santos',
            user_email: 'maria@example.com',
            phone: '0918-987-6543',
            court_number: '2',
            booking_date: '2024-02-16',
            time_slot: '7:00 AM - 8:00 AM',
            rate_type: 'Premium',
            total_amount: 750,
            payment_method: 'Cash',
            status: 'pending'
        },
        {
            id: 1003,
            customer_name: 'Pedro Reyes',
            user_email: 'pedro@example.com',
            phone: '0920-555-1212',
            court_number: '3',
            booking_date: '2024-02-17',
            time_slot: '8:00 AM - 9:00 AM',
            rate_type: 'Standard',
            total_amount: 500,
            payment_method: 'Credit Card',
            status: 'cancelled'
        },
        {
            id: 1004,
            customer_name: 'Ana Lopez',
            user_email: 'ana@example.com',
            phone: '0919-444-3333',
            court_number: '4',
            booking_date: '2024-02-18',
            time_slot: '9:00 AM - 10:00 AM',
            rate_type: 'Standard',
            total_amount: 500,
            payment_method: 'Bank Transfer',
            status: 'confirmed'
        }
    ];
}

function updateStatistics(bookings) {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'pending').length;
    const cancelled = bookings.filter(b => b.status === 'cancelled').length;
    
    document.getElementById('total-bookings').textContent = total;
    document.getElementById('confirmed-bookings').textContent = confirmed;
    document.getElementById('pending-bookings').textContent = pending;
    document.getElementById('cancelled-bookings').textContent = cancelled;
}

function renderBookingsTable(records) {
    const tableBody = document.getElementById('bookings-table-body');
    if (!tableBody) return;
    
    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="10">
                    <div class="empty-state">
                        <div class="empty-icon">📋</div>
                        <div class="empty-text">No bookings found</div>
                    </div>
                </td>
            </tr>`;
        return;
    }
    
    tableBody.innerHTML = records.map(booking => `
        <tr>
            <td>#KPBC-${String(booking.id).padStart(5, '0')}</td>
            <td>
                <div class="user-info">
                    <strong>${booking.customer_name || 'Customer'}</strong>
                    <span>${booking.user_email || ''}</span>
                </div>
            </td>
            <td>${booking.phone || 'N/A'}</td>
            <td>Court ${booking.court_number || 'N/A'}</td>
            <td>${booking.booking_date || 'N/A'}<br><small>${booking.time_slot || ''}</small></td>
            <td>${booking.rate_type || 'Standard'}</td>
            <td>₱${parseFloat(booking.total_amount || 0).toLocaleString()}</td>
            <td>${booking.payment_method || 'Cash'}</td>
            <td><span class="status-badge ${booking.status}">${booking.status}</span></td>
            <td>
                <div class="action-grid">
                    <button onclick="viewUserHistory('${booking.user_email}')" class="icon-btn btn-history" title="View History">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                    </button>

                    ${booking.status === 'pending' ? 
                        `<button onclick="updateStatus(${booking.id}, 'confirm')" class="icon-btn btn-confirm" title="Confirm Booking">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"></path></svg>
                        </button>` : ''}

                    <button onclick="deleteBooking(${booking.id})" class="icon-btn btn-delete" title="Delete Permanent">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ===== FILTER FUNCTIONS =====
function filterBookings() {
    const searchInput = document.getElementById('search-input');
    const statusFilter = document.getElementById('status-filter');
    
    if (!searchInput || !statusFilter) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const statusValue = statusFilter.value.toLowerCase();
    
    let filtered = allRecords;
    
    if (searchTerm) {
        filtered = filtered.filter(b => 
            (b.customer_name && b.customer_name.toLowerCase().includes(searchTerm)) ||
            (b.user_email && b.user_email.toLowerCase().includes(searchTerm)) ||
            String(b.id).includes(searchTerm) ||
            (b.phone && b.phone.includes(searchTerm))
        );
    }
    
    if (statusValue !== 'all') {
        filtered = filtered.filter(b => b.status === statusValue);
    }
    
    renderBookingsTable(filtered);
}

// ===== ACTION FUNCTIONS =====
async function updateStatus(id, action) {
    const actionText = action === 'confirm' ? 'confirm' : 'cancel';
    if (!confirm(`Are you sure you want to ${actionText} this booking?`)) return;
    
    try {
        // Optimistic update
        const booking = allRecords.find(b => b.id === id);
        if (booking) {
            booking.status = action === 'confirm' ? 'confirmed' : 'cancelled';
            updateStatistics(allRecords);
            filterBookings();
            showToast(`Booking ${booking.status}!`, 'success');
        }
        
        // Send to server
        const response = await fetch('admin_update_booking.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ booking_id: id, action: action })
        });
        
        const result = await response.json();
        if (!result.isOk) {
            console.error('Server update failed:', result.message);
            showToast('⚠️ Server update failed', 'error');
        }
    } catch (error) {
        console.error('Update error:', error);
        showToast('Network error. Change saved locally.', 'error');
    }
}

async function deleteBooking(id) {
    if (!confirm('Are you sure you want to delete this booking permanently?')) return;
    
    try {
        allRecords = allRecords.filter(b => b.id !== id);
        updateStatistics(allRecords);
        filterBookings();
        showToast('Booking deleted!', 'success');
        
        const response = await fetch('admin_update_booking.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ booking_id: id, action: 'delete' })
        });
        
        const result = await response.json();
        if (!result.isOk) {
            console.error('Server delete failed:', result.message);
            showToast('⚠️ Server delete failed', 'error');
        }
    } catch (error) {
        console.error('Delete error:', error);
        showToast('Network error. Deleted locally.', 'error');
    }
}

// ===== TOAST NOTIFICATION =====
function showToast(message, type = 'success') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 8px;
        font-weight: 600;
        z-index: 10000;
        animation: toastSlideIn 0.3s ease;
        min-width: 250px;
        max-width: 400px;
    `;
    
    const theme = document.documentElement.getAttribute('data-theme') || 'dark';
    if (theme === 'light') {
        toast.style.background = '#ffffff';
        toast.style.color = '#1e293b';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        toast.style.border = '1px solid #e2e8f0';
    } else {
        toast.style.background = '#1e293b';
        toast.style.color = '#f1f5f9';
        toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
        toast.style.border = '1px solid #334155';
    }
    
    if (type === 'success') {
        toast.style.background = '#10b981';
        toast.style.color = '#ffffff';
    } else if (type === 'error') {
        toast.style.background = '#ef4444';
        toast.style.color = '#ffffff';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'toastSlideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes toastSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .loading-spinner {
        display: inline-block;
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255,255,255,0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-right: 8px;
        vertical-align: middle;
    }
    @keyframes spin {
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);

window.addEventListener('load', () => {
    if (localStorage.getItem('adminLoggedIn') === 'true') {
        setTimeout(fetchBookingsFromDB, 1000);
    }
});