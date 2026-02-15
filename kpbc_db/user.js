// ==================== GLOBAL STATE ====================
let currentUser = null;
let bookingData = {
    court: null,
    date: null,
    time: null,
    duration: '2',
    equipment: {
        racket: 0,
        shuttlecock: 0,
        towel: 0
    },
    total: 0
};

// ==================== THEME LOGIC ====================
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

// ==================== SESSION & UI ====================
function syncUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    } else {
        showLandingPage();
    }
}

function updateUIForLoggedInUser() {
    const navGuest = document.querySelector('.nav-guest');
    const navUser = document.querySelector('.nav-user');
    const navBookings = document.querySelectorAll('.nav-bookings');
    const userDisplayName = document.getElementById('user-display-name');

    if (navGuest) navGuest.classList.add('hidden');
    if (navUser) navUser.classList.remove('hidden');
    navBookings.forEach(el => el.classList.remove('hidden'));
    
    if (userDisplayName && currentUser) {
        const firstName = currentUser.full_name?.split(' ')[0] || currentUser.email;
        userDisplayName.textContent = `Hi, ${firstName}`;
    }
}

function updateUIForLoggedOutUser() {
    document.querySelector('.nav-guest')?.classList.remove('hidden');
    document.querySelector('.nav-user')?.classList.add('hidden');
    document.querySelectorAll('.nav-bookings').forEach(el => el.classList.add('hidden'));
}

function showLandingPage() {
    showPage('home');
}

// ==================== PAGE NAVIGATION ====================
window.showPage = function(pageName) {
    document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById(pageName + '-page');
    if (target) target.classList.remove('hidden');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.textContent.toLowerCase().includes(pageName.toLowerCase())) {
            link.classList.add('active');
        }
    });
};

// ==================== AUTH MODAL CONTROLS ====================
window.openAuthModal = function(type = 'login') {
    document.getElementById('auth-modal').classList.add('active');
    document.getElementById('login-error').classList.add('hidden');
    document.getElementById('signup-error').classList.add('hidden');
    if (type === 'signup') {
        switchToSignup();
    } else {
        switchToLogin();
    }
};

window.closeAuthModal = function() {
    document.getElementById('auth-modal').classList.remove('active');
};

window.switchToSignup = function() {
    document.getElementById('login-form-container').classList.add('hidden');
    document.getElementById('signup-form-container').classList.remove('hidden');
};

window.switchToLogin = function() {
    document.getElementById('signup-form-container').classList.add('hidden');
    document.getElementById('login-form-container').classList.remove('hidden');
};

// ==================== AUTH API CALLS ====================
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value.trim();
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
            errorEl.textContent = result.message || 'Invalid email or password.';
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        errorEl.textContent = 'Server connection failed.';
        errorEl.classList.remove('hidden');
    }
}

async function handleSignup(event) {
    event.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const phone = document.getElementById('signup-phone').value.trim();
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
            alert('Registration successful! You can now log in.');
            switchToLogin();
            document.getElementById('login-email').value = email;
            document.getElementById('login-password').value = '';
            errorEl.classList.add('hidden');
        } else {
            errorEl.textContent = result.message || 'Registration failed.';
            errorEl.classList.remove('hidden');
        }
    } catch (err) {
        errorEl.textContent = 'Server connection failed.';
        errorEl.classList.remove('hidden');
    }
}

window.logout = function() {
    localStorage.removeItem('currentUser');
    currentUser = null;
    updateUIForLoggedOutUser();
    showPage('home');
};

// ==================== FORGOT PASSWORD ====================
window.handleForgotPassword = async function() {
    const email = prompt('Enter the email address associated with your account:');
    if (!email) return;
    if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    try {
        const response = await fetch('user_forgot_handler.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const result = await response.json();
        if (result.isOk) {
            // ⚠️ Remove debug_link in production!
            alert('Success! A reset link has been generated for testing:\n\n' + result.debug_link);
            console.log('Reset Link:', result.debug_link);
        } else {
            alert(result.message || 'Unable to process request.');
        }
    } catch (err) {
        console.error('Forgot password error:', err);
        alert('Failed to process request. Check your connection.');
    }
};

// ==================== BOOKING ACTIONS ====================
window.handleBookNowClick = function() {
    if (currentUser) {
        window.location.href = 'booking-page.html';
    } else {
        openAuthModal('login');
    }
};

window.redirectToBooking = function() {
    window.location.href = 'booking-page.html';
};

// ==================== BOOKING SYSTEM (for booking-page.html) ====================
function initBookingSystem() {
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
        bookingData.date = today;
    }
    
    const courtSelect = document.getElementById('court-select');
    if (courtSelect) {
        courtSelect.value = '1';
        bookingData.court = '1';
        courtSelect.addEventListener('change', function() {
            bookingData.court = this.value;
        });
    }
    
    const bookingDateInput = document.getElementById('booking-date');
    if (bookingDateInput) {
        bookingDateInput.addEventListener('change', function() {
            bookingData.date = this.value;
        });
    }
    
    document.querySelectorAll('.step').forEach(step => {
        step.addEventListener('click', function() {
            const stepNum = parseInt(this.getAttribute('data-step'));
            if (stepNum > 1) {
                goToBookingStep(stepNum);
            }
        });
    });
}

function goToBookingStep(step) {
    document.querySelectorAll('.booking-form').forEach(form => {
        form.classList.remove('active');
    });
    
    document.querySelectorAll('.step').forEach(stepEl => {
        const stepNum = parseInt(stepEl.getAttribute('data-step'));
        stepEl.classList.remove('active', 'completed');
        if (stepNum < step) stepEl.classList.add('completed');
        if (stepNum === step) stepEl.classList.add('active');
    });
    
    const stepForm = document.getElementById(`booking-form-step${step}`);
    if (stepForm) {
        stepForm.classList.add('active');
    }
    
    if (step >= 2) {
        createBookingSteps(step);
    }
}

function createBookingSteps(currentStep) {
    const container = document.querySelector('.booking-form-container');
    if (!container) return;
    
    // Step 2: Time Selection
    if (currentStep >= 2 && !document.getElementById('booking-form-step2')) {
        const step2HTML = `
            <form id="booking-form-step2" class="booking-form ${currentStep === 2 ? 'active' : ''}">
                <h2>Select Time Slot</h2>
                <div class="form-group">
                    <label>Select Time *</label>
                    <select id="time-select" required>
                        <option value="06:00-08:00">6:00 AM - 8:00 AM</option>
                        <option value="08:00-10:00">8:00 AM - 10:00 AM</option>
                        <option value="10:00-12:00">10:00 AM - 12:00 PM</option>
                        <option value="12:00-14:00">12:00 PM - 2:00 PM</option>
                        <option value="14:00-16:00">2:00 PM - 4:00 PM</option>
                        <option value="16:00-18:00">4:00 PM - 6:00 PM</option>
                        <option value="18:00-20:00">6:00 PM - 8:00 PM</option>
                        <option value="20:00-22:00">8:00 PM - 10:00 PM</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Select Rate Type *</label>
                    <select id="rate-type-select" required>
                        <option value="hourly">Hourly Rate (₱170/hour)</option>
                        <option value="play_all">Play All You Can (₱200)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Duration (hours) *</label>
                    <select id="duration-select" required>
                        <option value="1">1 hour</option>
                        <option value="2" selected>2 hours</option>
                        <option value="3">3 hours</option>
                        <option value="4">4 hours</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="goToBookingStep(1)">Back</button>
                    <button type="button" class="btn btn-primary" onclick="goToBookingStep(3)">Next</button>
                </div>
            </form>
        `;
        container.insertAdjacentHTML('beforeend', step2HTML);
        
        setTimeout(() => {
            const timeSelect = document.getElementById('time-select');
            const rateTypeSelect = document.getElementById('rate-type-select');
            const durationSelect = document.getElementById('duration-select');
            
            if (timeSelect) {
                timeSelect.addEventListener('change', function() {
                    bookingData.time = this.value;
                });
                bookingData.time = timeSelect.value;
            }
            
            if (rateTypeSelect) {
                rateTypeSelect.addEventListener('change', function() {
                    if (this.value === 'play_all') {
                        document.getElementById('duration-select').disabled = true;
                        bookingData.duration = 'play_all';
                    } else {
                        document.getElementById('duration-select').disabled = false;
                    }
                });
            }
            
            if (durationSelect) {
                durationSelect.addEventListener('change', function() {
                    bookingData.duration = this.value;
                });
                bookingData.duration = durationSelect.value;
            }
        }, 100);
    }
    
    // Step 3: Equipment
    if (currentStep >= 3 && !document.getElementById('booking-form-step3')) {
        const step3HTML = `
            <form id="booking-form-step3" class="booking-form ${currentStep === 3 ? 'active' : ''}">
                <h2>Add Equipment (Optional)</h2>
                <div class="equipment-section">
                    <div class="equipment-item">
                        <div class="equipment-info">
                            <span class="equipment-name">Yonex Racket</span>
                            <span class="equipment-price">₱50</span>
                        </div>
                        <div class="equipment-quantity">
                            <button type="button" class="qty-btn minus" data-item="racket">-</button>
                            <span class="qty-value" data-item="racket">0</span>
                            <button type="button" class="qty-btn plus" data-item="racket">+</button>
                        </div>
                    </div>
                    <div class="equipment-item">
                        <div class="equipment-info">
                            <span class="equipment-name">Shuttlecock (Tube of 12)</span>
                            <span class="equipment-price">₱30</span>
                        </div>
                        <div class="equipment-quantity">
                            <button type="button" class="qty-btn minus" data-item="shuttlecock">-</button>
                            <span class="qty-value" data-item="shuttlecock">0</span>
                            <button type="button" class="qty-btn plus" data-item="shuttlecock">+</button>
                        </div>
                    </div>
                    <div class="equipment-item">
                        <div class="equipment-info">
                            <span class="equipment-name">Towel</span>
                            <span class="equipment-price">₱20</span>
                        </div>
                        <div class="equipment-quantity">
                            <button type="button" class="qty-btn minus" data-item="towel">-</button>
                            <span class="qty-value" data-item="towel">0</span>
                            <button type="button" class="qty-btn plus" data-item="towel">+</button>
                        </div>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="goToBookingStep(2)">Back</button>
                    <button type="button" class="btn btn-primary" onclick="goToBookingStep(4)">Next</button>
                </div>
            </form>
        `;
        container.insertAdjacentHTML('beforeend', step3HTML);
        
        setTimeout(() => {
            document.querySelectorAll('.qty-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const item = this.getAttribute('data-item');
                    const isPlus = this.classList.contains('plus');
                    const qtySpan = document.querySelector(`.qty-value[data-item="${item}"]`);
                    let currentQty = parseInt(qtySpan.textContent);
                    
                    if (isPlus) {
                        currentQty++;
                    } else if (currentQty > 0) {
                        currentQty--;
                    }
                    
                    qtySpan.textContent = currentQty;
                    bookingData.equipment[item] = currentQty;
                });
            });
        }, 100);
    }
    
    // Step 4: Review & Confirm
    if (currentStep >= 4 && !document.getElementById('booking-form-step4')) {
        const step4HTML = `
            <form id="booking-form-step4" class="booking-form ${currentStep === 4 ? 'active' : ''}">
                <h2>Review & Confirm</h2>
                <div class="booking-summary">
                    <div class="summary-row">
                        <span>Court:</span>
                        <span id="summary-court">Court ${bookingData.court || '1'}</span>
                    </div>
                    <div class="summary-row">
                        <span>Date:</span>
                        <span id="summary-date">${bookingData.date ? new Date(bookingData.date).toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                        }) : 'Select a date'}</span>
                    </div>
                    <div class="summary-row">
                        <span>Time:</span>
                        <span id="summary-time">${bookingData.time ? bookingData.time.replace('-', ' to ') : 'Select a time'}</span>
                    </div>
                    <div class="summary-row">
                        <span>Rate Type:</span>
                        <span id="summary-rate-type">${document.getElementById('rate-type-select') ? document.getElementById('rate-type-select').value === 'play_all' ? 'Play All You Can' : 'Hourly Rate' : 'Hourly Rate'}</span>
                    </div>
                    <div class="summary-row">
                        <span>Duration:</span>
                        <span id="summary-duration">${bookingData.duration === 'play_all' ? 'Unlimited' : bookingData.duration + ' hours'}</span>
                    </div>
                    <div class="summary-row">
                        <span>Court Fee:</span>
                        <span id="summary-court-fee">₱0</span>
                    </div>
                    <div class="summary-row">
                        <span>Equipment:</span>
                        <span id="summary-equipment">₱0</span>
                    </div>
                    <div class="summary-row total">
                        <span>Total Amount:</span>
                        <span id="summary-total">₱0</span>
                    </div>
                </div>
                <div class="form-group">
                    <label>Special Instructions (Optional)</label>
                    <textarea id="special-notes" rows="3" placeholder="Any special requests or instructions..."></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary" onclick="goToBookingStep(3)">Back</button>
                    <button type="button" class="btn btn-primary" onclick="confirmBooking()">Confirm Booking</button>
                </div>
            </form>
        `;
        container.insertAdjacentHTML('beforeend', step4HTML);
        updateBookingSummary();
    }
}

function updateBookingSummary() {
    let courtFee = 0;
    const rateTypeSelect = document.getElementById('rate-type-select');
    const durationSelect = document.getElementById('duration-select');
    
    if (rateTypeSelect && durationSelect) {
        if (rateTypeSelect.value === 'play_all') {
            courtFee = 200;
        } else {
            courtFee = parseInt(durationSelect.value) * 170;
        }
    } else {
        courtFee = bookingData.duration === 'play_all' ? 200 : parseInt(bookingData.duration) * 170;
    }
    
    const equipmentCost = 
        (bookingData.equipment.racket * 50) +
        (bookingData.equipment.shuttlecock * 30) +
        (bookingData.equipment.towel * 20);
    
    const total = courtFee + equipmentCost;
    
    document.getElementById('summary-court-fee').textContent = `₱${courtFee}`;
    document.getElementById('summary-equipment').textContent = `₱${equipmentCost}`;
    document.getElementById('summary-total').textContent = `₱${total}`;
    
    bookingData.total = total;
}

async function confirmBooking() {
    if (!currentUser) {
        alert('Please login to book a court.');
        openAuthModal('login');
        return;
    }
    
    if (!bookingData.court || !bookingData.date || !bookingData.time) {
        alert('Please fill in all required fields.');
        return;
    }
    
    const rateTypeSelect = document.getElementById('rate-type-select');
    const durationSelect = document.getElementById('duration-select');
    const rateType = rateTypeSelect ? rateTypeSelect.value : 'hourly';
    const duration = rateType === 'play_all' ? 'play_all' : (durationSelect ? durationSelect.value : '2');
    
    const bookingPayload = {
        user_id: currentUser.id,
        court: bookingData.court,
        date: bookingData.date,
        time: bookingData.time,
        rate: rateType === 'play_all' ? 'play_all' : 'hourly',
        duration: duration,
        equipment: bookingData.equipment,
        total: bookingData.total,
        notes: document.getElementById('special-notes') ? document.getElementById('special-notes').value : '',
        payment: 'cash'
    };
    
    try {
        const response = await fetch('save_booking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload)
        });
        
        const result = await response.json();
        
        if (result.isOk) {
            alert('Booking confirmed successfully! Your booking ID: ' + (result.booking_id || 'BKG' + Date.now()));
            
            bookingData = {
                court: null,
                date: null,
                time: null,
                duration: '2',
                equipment: { racket: 0, shuttlecock: 0, towel: 0 },
                total: 0
            };
            
            document.querySelectorAll('.booking-form').forEach(form => form.remove());
            goToBookingStep(1);
            initBookingSystem();
            
        } else {
            alert('Error: ' + result.message);
        }
    } catch (error) {
        alert('Error saving booking: ' + error.message);
        
        // Fallback: Save to localStorage for demo
        const bookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
        bookingPayload.id = 'BKG' + Date.now();
        bookingPayload.booking_id = bookingPayload.id;
        bookingPayload.status = 'confirmed';
        bookingPayload.created_at = new Date().toISOString();
        bookings.push(bookingPayload);
        localStorage.setItem('user_bookings', JSON.stringify(bookings));
        
        alert('Booking saved locally (demo mode). In production, this would save to the server.');
        
        document.querySelectorAll('.booking-form').forEach(form => form.remove());
        goToBookingStep(1);
        initBookingSystem();
    }
}

// ==================== USER PREFERENCES ====================
function initializeUserPreferences(user) {
    const preferences = {
        skill_level: 'beginner',
        preferred_court: 'any',
        notifications: {
            email: true,
            sms: true,
            reminders: true
        },
        avatar: '👤',
        created_at: new Date().toISOString()
    };
    
    const allPreferences = JSON.parse(localStorage.getItem('user_preferences')) || {};
    allPreferences[user.id] = preferences;
    localStorage.setItem('user_preferences', JSON.stringify(allPreferences));
}

function saveUserPreferences(preferences) {
    if (!currentUser) return;
    
    const allPreferences = JSON.parse(localStorage.getItem('user_preferences')) || {};
    allPreferences[currentUser.id] = { ...allPreferences[currentUser.id], ...preferences };
    localStorage.setItem('user_preferences', JSON.stringify(allPreferences));
}

function loadUserPreferences() {
    if (!currentUser) return {};
    
    const allPreferences = JSON.parse(localStorage.getItem('user_preferences')) || {};
    return allPreferences[currentUser.id] || {};
}

// ==================== LOAD USER BOOKINGS ====================
async function loadUserBookings() {
    if (!currentUser) return;
    
    try {
        const bookings = JSON.parse(localStorage.getItem('user_bookings') || '[]');
        const userBookings = bookings.filter(b => b.user_id == currentUser.id);
        displayUserBookings(userBookings);
    } catch (error) {
        console.error('Error loading bookings:', error);
    }
}

function displayUserBookings(bookings) {
    const bookingsPage = document.getElementById('bookings-page');
    if (!bookingsPage) return;
    
    const bookingsList = document.querySelector('.bookings-list');
    if (bookingsList) {
        if (bookings.length === 0) {
            bookingsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <h3>No bookings yet</h3>
                    <p>Book your first court to get started!</p>
                    <button class="btn btn-primary" onclick="handleBookNowClick()">Book a Court</button>
                </div>
            `;
        } else {
            let html = '<div class="booking-history"><h3>Your Booking History</h3>';
            
            bookings.forEach(booking => {
                const date = new Date(booking.date);
                const timeRange = booking.time ? booking.time.split('-') : ['', ''];
                
                html += `
                    <div class="booking-card">
                        <div class="booking-header">
                            <div class="booking-id">${booking.booking_id || booking.id}</div>
                            <div class="booking-status ${booking.status || 'confirmed'}">${booking.status || 'confirmed'}</div>
                        </div>
                        <div class="booking-details">
                            <div class="detail-item">
                                <div class="detail-label">Court</div>
                                <div class="detail-value">Court ${booking.court}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Date</div>
                                <div class="detail-value">${date.toLocaleDateString()}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Time</div>
                                <div class="detail-value">${timeRange[0]} - ${timeRange[1]}</div>
                            </div>
                            <div class="detail-item">
                                <div class="detail-label">Amount</div>
                                <div class="detail-value">₱${booking.total}</div>
                            </div>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            bookingsList.innerHTML = html;
        }
    }
}

// ==================== NOTIFICATIONS (Admin badge) ====================
function checkNotifications() {
    try {
        const notification = localStorage.getItem('newBookingNotification');
        if (notification) {
            const data = JSON.parse(notification);
            const badge = document.getElementById('admin-notification');
            if (badge) {
                badge.style.display = 'flex';
                badge.title = `New booking: ${data.message}`;
            }
            setTimeout(() => {
                localStorage.removeItem('newBookingNotification');
                if (badge) badge.style.display = 'none';
            }, 10000);
        }
    } catch (e) {
        console.log('Notification error:', e);
    }
}

// ==================== ADD DYNAMIC STYLES ====================
function addBookingStyles() {
    if (!document.getElementById('booking-styles')) {
        const style = document.createElement('style');
        style.id = 'booking-styles';
        style.textContent = `
            .booking-history { margin-top: 2rem; }
            .booking-history h3 { margin-bottom: 1.5rem; color: #1a1a1a; font-size: 1.5rem; font-weight: 700; }
            .booking-card { background: #ffffff; border-radius: 12px; padding: 1.5rem; margin-bottom: 1rem; border: 1px solid #e5e5e5; transition: all 0.3s ease; }
            .booking-card:hover { border-color: #0066ff; box-shadow: 0 4px 12px rgba(0, 102, 255, 0.1); }
            .booking-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 1rem; }
            .booking-id { font-weight: 700; color: #0066ff; font-size: 1.1rem; }
            .booking-status { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; font-weight: 600; }
            .booking-status.confirmed { background: #dcfce7; color: #16a34a; }
            .booking-status.cancelled { background: #fee2e2; color: #dc2626; }
            .booking-status.pending { background: #fef3c7; color: #d97706; }
            .booking-details { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; }
            .detail-item { margin-bottom: 0.5rem; }
            .detail-label { font-size: 0.85rem; color: #666; margin-bottom: 0.25rem; }
            .detail-value { font-weight: 600; color: #1a1a1a; }
            .empty-state { text-align: center; padding: 4rem 2rem; color: #999; }
            .empty-state-icon { font-size: 4rem; margin-bottom: 1rem; opacity: 0.5; }
            .empty-state h3 { margin-bottom: 0.5rem; color: #666; }
            .empty-state p { margin-bottom: 1.5rem; color: #999; }
            .equipment-section { margin: 1.5rem 0; }
            .equipment-item { display: flex; justify-content: space-between; align-items: center; padding: 1rem; border: 1px solid #e5e5e5; border-radius: 8px; margin-bottom: 1rem; background: #f8f9fa; }
            .equipment-info { flex: 1; }
            .equipment-name { font-weight: 600; display: block; margin-bottom: 0.25rem; }
            .equipment-price { color: #666; font-size: 0.9rem; }
            .equipment-quantity { display: flex; align-items: center; gap: 0.5rem; }
            .qty-btn { width: 30px; height: 30px; border: 1px solid #e5e5e5; background: white; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 1rem; display: flex; align-items: center; justify-content: center; }
            .qty-btn:hover { background: #f5f5f5; }
            .qty-value { min-width: 30px; text-align: center; font-weight: 600; font-size: 1.1rem; }
            .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
            .form-actions button { flex: 1; }
            .booking-summary { background: #f0f7ff; padding: 1.5rem; border-radius: 12px; border: 2px solid #0066ff; margin: 1.5rem 0; }
            .summary-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(0, 102, 255, 0.1); }
            .summary-row.total { border-bottom: none; border-top: 2px solid #0066ff; margin-top: 0.5rem; padding-top: 1rem; font-size: 1.2rem; font-weight: 700; color: #0066ff; }
            [data-theme="dark"] .booking-card { background: #334155; border-color: #475569; }
            [data-theme="dark"] .detail-value { color: #e2e8f0; }
            [data-theme="dark"] .equipment-item { background: #475569; border-color: #64748b; }
            [data-theme="dark"] .booking-summary { background: #1e40af; border-color: #3b82f6; }
            [data-theme="dark"] .summary-row { border-color: rgba(59, 130, 246, 0.3); }
            [data-theme="dark"] .summary-row.total { border-color: #3b82f6; }
        `;
        document.head.appendChild(style);
    }
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    syncUserSession();

    document.getElementById('login-form')?.addEventListener('submit', handleLogin);
    document.getElementById('signup-form')?.addEventListener('submit', handleSignup);

    const courtsAvailable = document.getElementById('courts-available');
    if (courtsAvailable) {
        courtsAvailable.textContent = Math.floor(Math.random() * 3) + 8;
    }

    checkNotifications();
    setInterval(checkNotifications, 10000);

    if (document.getElementById('bookings-page')) {
        initBookingSystem();
        if (currentUser) loadUserBookings();
        addBookingStyles();
    }
});

// Attach functions to window for inline onclick attributes
window.showPage = showPage;
window.handleBookNowClick = handleBookNowClick;
window.redirectToBooking = redirectToBooking;
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchToLogin = switchToLogin;
window.switchToSignup = switchToSignup;
window.logout = logout;
window.handleForgotPassword = handleForgotPassword;
window.goToBookingStep = goToBookingStep;
window.confirmBooking = confirmBooking;