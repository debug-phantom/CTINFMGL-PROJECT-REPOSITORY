document.addEventListener('DOMContentLoaded', () => {
    let userEmail = localStorage.getItem('user_history_email');

    if (!userEmail) {
        renderEmailPrompt();
    } else {
        document.getElementById('user-display-email').textContent = `Showing all records for: ${userEmail}`;
        fetchUserHistory(userEmail);
    }
});

async function fetchUserHistory(email) {
    const container = document.getElementById('history-list');
    container.innerHTML = '<div class="loading-state">⏳ Syncing records...</div>';

    try {
        const response = await fetch(`user_get_history.php?email=${encodeURIComponent(email)}`);
        
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Non-JSON response:', text.substring(0, 200));
            throw new Error('Server returned HTML. Check if user_get_history.php exists and has no errors.');
        }

        const data = await response.json();

        // If the response has an 'error' property, show it
        if (data.error) {
            container.innerHTML = `
                <div class="empty-state" style="border-left: 4px solid var(--error-color);">
                    <p style="color: var(--error-color); margin-bottom:15px;">⚠️ ${data.error}</p>
                    <button onclick="clearEmail()" class="btn btn-secondary">Try another email</button>
                </div>`;
            return;
        }

        // data should be an array
        if (!Array.isArray(data)) {
            throw new Error('Unexpected response format');
        }

        if (data.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p style="color: var(--text-secondary); margin-bottom:15px;">No bookings found for <b>${email}</b></p>
                    <button onclick="clearEmail()" class="btn btn-secondary">Search Different User</button>
                </div>`;
            return;
        }

        // Render bookings
        container.innerHTML = data.map(b => `
            <div class="booking-card">
                <div class="booking-info">
                    <h3 style="color: var(--text-primary); margin-bottom:4px;">Court ${b.court_number}</h3>
                    <p style="color: var(--text-secondary); font-size: 0.9rem;">${formatDate(b.booking_date)} • ${b.slot_name}</p>
                    <span style="font-size: 10px; color: var(--muted); letter-spacing: 0.5px;">REF: #KPBC-${String(b.id).padStart(5, '0')}</span>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); margin-bottom: 8px;">
                        ₱${parseFloat(b.total_amount).toLocaleString()}
                    </div>
                    <span class="status-badge ${b.status.toLowerCase()}">${b.status}</span>
                </div>
            </div>
        `).join('') + `
            <div style="margin-top: 30px; text-align: center;">
                <button onclick="clearEmail()" class="btn btn-secondary" style="opacity: 0.8; font-size: 0.85rem;">
                    🔍 View Another Email
                </button>
            </div>
        `;

    } catch (error) {
        console.error('History fetch error:', error);
        container.innerHTML = `
            <div class="empty-state" style="border-left: 4px solid var(--error-color);">
                <p style="color: var(--error-color); margin-bottom:15px;">❌ Error connecting to the server.</p>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-bottom:20px;">
                    ${error.message || 'Please try again later.'}
                </p>
                <button onclick="clearEmail()" class="btn btn-secondary">Try Again</button>
            </div>`;
    }
}

function renderEmailPrompt() {
    document.getElementById('history-list').innerHTML = `
        <div style="background: var(--bg-card); padding: 30px; border-radius: 12px; border: 1px solid var(--border-color);">
            <h2 style="color: var(--text-primary); margin-bottom: 1rem;">🔎 Lookup User</h2>
            <div class="form-group">
                <label for="lookup-email" style="color: var(--text-secondary);">Enter customer email:</label>
                <input type="email" id="lookup-email" placeholder="e.g. juan@example.com" 
                       style="width:100%; padding:12px; background: var(--bg-primary); border: 2px solid var(--border-color); color: var(--text-primary); border-radius:8px; margin-top: 8px;">
            </div>
            <button onclick="saveAndFetch()" class="btn btn-primary" style="width:100%; margin-top:20px;">
                📋 Search History
            </button>
        </div>
    `;
}

function saveAndFetch() {
    const email = document.getElementById('lookup-email').value.trim();
    if (email && email.includes('@')) {
        localStorage.setItem('user_history_email', email);
        location.reload();
    } else {
        alert('Please enter a valid email address.');
    }
}

function clearEmail() {
    localStorage.removeItem('user_history_email');
    location.reload();
}

function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
        return new Date(dateStr).toLocaleDateString('en-US', { 
            month: 'short', day: 'numeric', year: 'numeric' 
        });
    } catch (e) {
        return dateStr;
    }
}