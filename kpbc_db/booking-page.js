// ============================================
// Katipunan Prime Booking System – PRODUCTION
// FULLY FIXED – Receipt content restored, all functions working
// ============================================

let booking = {
    court: null,
    date: null,
    time: null,
    rate: 'hourly',
    equip: { racket: 0, shuttlecock: 0, shoes: 0, water: 0 },
    total: 0,
    paymentMethod: null,
    email: "jamescastrol23@gmail.com",
    customer_name: "",
    phone: "",
    status: 'pending'
};

// ---------- THEME TOGGLE ----------
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const themeText = document.getElementById('theme-text');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeText(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme');
            const newTheme = current === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateThemeText(newTheme);
            showNotification(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode activated`, 'info');
        });
    }

    function updateThemeText(theme) {
        if (themeText) themeText.textContent = theme === 'dark' ? 'Dark Mode' : 'Light Mode';
    }
}

// ---------- STEP NAVIGATION ----------
window.nextStep = function(step) {
    if (step === 2 && !booking.court) {
        showNotification('Please select a court.', 'error');
        return;
    }
    if (step === 3 && !booking.time) {
        showNotification('Please select a time slot.', 'error');
        return;
    }
    if (step === 4) {
        const hasEquipment = Object.values(booking.equip).some(q => q > 0);
        if (hasEquipment && !confirm('You have selected equipment rentals. Continue to review?')) {
            return;
        }
    }

    document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
    const target = document.getElementById(`step-${step}`);
    if (target) target.classList.remove('hidden');

    document.querySelectorAll('.step').forEach((el, idx) => {
        el.classList.remove('active', 'completed');
        if (idx + 1 < step) el.classList.add('completed');
        if (idx + 1 === step) el.classList.add('active');
    });

    // STEP 4: Populate summary
    if (step === 4) {
        const base = booking.rate === 'all' ? 200 : 340;
        const extras = (booking.equip.racket * 50) +
                       (booking.equip.shuttlecock * 30) +
                       (booking.equip.shoes * 80) +
                       (booking.equip.water * 15);
        booking.total = base + extras;

        document.getElementById('res-court').textContent = `Court ${booking.court}`;
        document.getElementById('res-time').textContent = booking.time;
        document.getElementById('res-total').textContent = `₱${booking.total}`;
        document.getElementById('res-rate-type').textContent =
            booking.rate === 'all' ? 'Play-All (₱200)' : 'Hourly (₱170/hour)';

        const equipItems = [];
        if (booking.equip.racket > 0) equipItems.push(`${booking.equip.racket} x Racket`);
        if (booking.equip.shuttlecock > 0) equipItems.push(`${booking.equip.shuttlecock} x Shuttlecock`);
        if (booking.equip.shoes > 0) equipItems.push(`${booking.equip.shoes} x Shoes`);
        if (booking.equip.water > 0) equipItems.push(`${booking.equip.water} x Water`);
        const equipDiv = document.getElementById('equipment-items');
        if (equipDiv) {
            equipDiv.innerHTML = equipItems.length
                ? equipItems.map(item => `<div>• ${item}</div>`).join('')
                : 'No equipment selected';
        }
    }

    // STEP 5: Payment prep
    if (step === 5) {
        if (!booking.paymentMethod) {
            const firstMethod = document.querySelector('.pay-box');
            if (firstMethod) firstMethod.click();
        }
        document.getElementById('payment-total').textContent = `₱${booking.total || 515}`;

        const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
        const emailField = document.getElementById('user-email');
        if (currentUser) {
            emailField.value = currentUser.email;
            booking.email = currentUser.email;
            booking.customer_name = currentUser.full_name || currentUser.name;
            booking.phone = currentUser.phone;
        } else {
            booking.email = emailField.value;
        }
    }
};

// ---------- EQUIPMENT COUNTER ----------
window.adjQty = function(item, delta) {
    const current = booking.equip[item] || 0;
    const newQty = Math.max(0, current + delta);
    booking.equip[item] = newQty;
    const display = document.getElementById(`q-${item}`);
    if (display) display.textContent = newQty;

    if (!document.getElementById('step-4').classList.contains('hidden') ||
        !document.getElementById('step-5').classList.contains('hidden')) {
        const base = booking.rate === 'all' ? 200 : 340;
        const extras = (booking.equip.racket * 50) +
                       (booking.equip.shuttlecock * 30) +
                       (booking.equip.shoes * 80) +
                       (booking.equip.water * 15);
        booking.total = base + extras;

        if (!document.getElementById('step-4').classList.contains('hidden')) {
            document.getElementById('res-total').textContent = `₱${booking.total}`;
        }
        if (!document.getElementById('step-5').classList.contains('hidden')) {
            document.getElementById('payment-total').textContent = `₱${booking.total}`;
        }
    }

    const names = { racket: 'Racket', shuttlecock: 'Shuttlecock', shoes: 'Shoes', water: 'Water' };
    const price = getItemPrice(item);
    if (delta > 0) {
        showNotification(`Added ${names[item]} (₱${price} each)`, 'info');
    } else if (delta < 0 && current > 0) {
        showNotification(`Removed ${names[item]}`, 'info');
    }
};

function getItemPrice(item) {
    const prices = { racket: 50, shuttlecock: 30, shoes: 80, water: 15 };
    return prices[item] || 0;
}

// ---------- NOTIFICATION ----------
function showNotification(msg, type = 'info') {
    const notif = document.createElement('div');
    notif.className = `notification ${type}`;
    notif.textContent = msg;
    notif.style.cssText = `
        position: fixed; top: 100px; right: 20px;
        background: ${type === 'error' ? 'var(--error-color)' : type === 'success' ? 'var(--success-color)' : 'var(--brand)'};
        color: white; padding: 12px 20px; border-radius: 8px; z-index: 10000;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease; max-width: 300px;
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        notif.style.transform = 'translateX(100%)';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ---------- FINAL BOOKING SUBMISSION ----------
window.finishBooking = async function() {
    if (!booking.paymentMethod) {
        showNotification('Please select a payment method.', 'error');
        return;
    }

    const emailField = document.getElementById('user-email');
    booking.email = emailField ? emailField.value.trim() : '';

    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (currentUser) {
        booking.customer_name = currentUser.full_name || currentUser.name || 'Guest';
        booking.phone = currentUser.phone || 'Not provided';
    } else {
        booking.customer_name = `Guest-${Date.now().toString().slice(-6)}`;
        booking.phone = 'Not provided';
    }

    // --- PAYLOAD: matches database columns EXACTLY ---
    const payload = {
        customer_name: booking.customer_name,
        user_email: booking.email,
        phone: booking.phone,
        court_number: booking.court || '1',
        booking_date: booking.date || document.getElementById('booking-date').value,
        time_slot: booking.time || '10:00-12:00',
        rate_type: booking.rate === 'all' ? 'Play-All' : 'Hourly',
        total_amount: booking.total || 340,
        payment_method: booking.paymentMethod || 'cash',
        status: 'pending'
    };
    // ------------------------------------------------

    const btn = document.getElementById('confirm-pay-btn');
    if (btn) {
        btn.innerHTML = '<span style="margin-right: 8px;">⏳</span> Processing...';
        btn.disabled = true;
    }

    try {
        const response = await fetch('save_booking.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const text = await response.text();
            console.error('Server returned non-JSON:', text.substring(0, 200));
            throw new Error('Server error: Check save_booking.php for PHP warnings.');
        }

        const result = await response.json();

        if (result.isOk === true) {
            const bookingId = result.formatted_id || `KPBC-${Date.now().toString().slice(-6)}`;
            document.getElementById('final-id').textContent = bookingId;

            const dateInput = document.getElementById('booking-date');
            if (dateInput && dateInput.value) {
                const d = new Date(dateInput.value);
                document.getElementById('success-date').textContent = d.toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
                });
            }
            document.getElementById('success-court').textContent = `Court ${booking.court || 1}`;
            document.getElementById('success-time').textContent = booking.time || '10:00-12:00';
            document.getElementById('success-amount').textContent = `₱${booking.total || 0}`;
            document.getElementById('success-payment').textContent = booking.paymentMethod?.toUpperCase() || 'CASH';

            const statusEl = document.getElementById('email-status');
            if (statusEl) {
                statusEl.textContent = booking.email
                    ? `📧 Confirmation sent to ${booking.email}`
                    : '✅ Booking confirmed!';
                statusEl.style.color = 'var(--success-color)';
            }

            localStorage.setItem('newBookingNotification', JSON.stringify({
                id: result.booking_id || Date.now(),
                booking_id: bookingId,
                time: new Date().toISOString(),
                message: `New booking: Court ${booking.court} at ${booking.time}`
            }));

            document.getElementById('success-overlay').classList.remove('hidden');
            showNotification('Booking confirmed!', 'success');
        } else {
            showNotification(result.message || 'Booking failed. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showNotification(error.message, 'error');
    } finally {
        if (btn) {
            btn.innerHTML = '<span style="font-size: 1.1rem;">✅</span> Confirm & Pay';
            btn.disabled = false;
        }
    }
};

// ---------- RECEIPT MODAL – FULLY RESTORED ----------
window.showReceipt = function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');

    const playDate = booking.date
        ? new Date(booking.date).toLocaleDateString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })
        : 'N/A';

    const now = new Date();
    const bookingDateStr = now.toLocaleDateString('en-US', {
        year: 'numeric', month: 'numeric', day: 'numeric'
    });

    const customerName = currentUser?.full_name || booking.customer_name || 'Guest';
    const customerEmail = booking.email || 'N/A';
    const customerPhone = booking.phone || 'N/A';

    const courtNumber = booking.court || '1';
    const timeSlot = booking.time || '10:00-12:00';
    const rateTypeText = booking.rate === 'all'
        ? 'Play-All (₱200)'
        : `Hourly (₱170/hr × 2 = ₱340)`;

    const eq = booking.equip;
    const lines = [];
    if (eq.racket > 0) lines.push(`Racket x${eq.racket} – ₱${eq.racket * 50}`);
    if (eq.shuttlecock > 0) lines.push(`Shuttlecock x${eq.shuttlecock} – ₱${eq.shuttlecock * 30}`);
    if (eq.shoes > 0) lines.push(`Shoes x${eq.shoes} – ₱${eq.shoes * 80}`);
    if (eq.water > 0) lines.push(`Water x${eq.water} – ₱${eq.water * 15}`);

    const equipmentHtml = lines.length
        ? lines.map(l => `<div style="margin-left: 0.8rem;">• ${l}</div>`).join('')
        : '<div style="color: var(--text-secondary); margin-left: 0.8rem;">None</div>';

    const totalAmount = booking.total || 0;
    const paymentMethod = booking.paymentMethod?.toUpperCase() || 'CASH';
    const bookingRef = document.getElementById('final-id').textContent;

    const receiptHTML = `
        <div style="border-bottom: 1px solid var(--brand); padding-bottom: 0.8rem; margin-bottom: 0.8rem;">
            <div style="font-size: 1rem; font-weight: 700;">Katipunan Prime Badminton Center</div>
            <div style="font-size: 0.7rem; color: var(--text-secondary);">52 Katipunan St., Marikina City</div>
            <div style="font-size: 0.7rem; color: var(--text-secondary);">info@katipunanprime.com | (02) 1234-567</div>
        </div>
        <div style="margin-bottom: 0.8rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                <span style="font-weight: 600;">Booking Reference:</span>
                <span style="font-family: monospace;">${bookingRef}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.3rem; font-size: 0.75rem;">
                <span style="font-weight: 600;">Date of Booking:</span>
                <span>${bookingDateStr}</span>
            </div>
        </div>
        <div style="background: var(--brand-soft); padding: 0.8rem; border-radius: 6px; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem;">
                <span style="font-weight: 600;">Customer:</span><span>${customerName}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.2rem; font-size: 0.75rem;">
                <span style="font-weight: 600;">Email:</span><span>${customerEmail}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.2rem; font-size: 0.75rem;">
                <span style="font-weight: 600;">Phone:</span><span>${customerPhone}</span>
            </div>
        </div>
        <div style="margin-bottom: 1rem;">
            <div style="font-weight: 600; margin-bottom: 0.3rem; font-size: 0.8rem;">Court Details</div>
            <div style="display: flex; justify-content: space-between; margin-left: 0.8rem; font-size: 0.75rem;">
                <span>Court:</span><span style="font-weight: 600;">Court ${courtNumber}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-left: 0.8rem; margin-top: 0.2rem; font-size: 0.75rem;">
                <span>Date:</span><span>${playDate}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-left: 0.8rem; margin-top: 0.2rem; font-size: 0.75rem;">
                <span>Time:</span><span>${timeSlot.replace('-', '–')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-left: 0.8rem; margin-top: 0.2rem; font-size: 0.75rem;">
                <span>Rate Type:</span><span>${rateTypeText}</span>
            </div>
        </div>
        <div style="margin-bottom: 1rem;">
            <div style="font-weight: 600; margin-bottom: 0.3rem; font-size: 0.8rem;">Equipment Rentals</div>
            ${equipmentHtml}
        </div>
        <div style="margin-bottom: 0.5rem; padding-top: 0.5rem; border-top: 2px solid var(--brand);">
            <div style="display: flex; justify-content: space-between; font-size: 1rem; font-weight: 700;">
                <span>Total Paid:</span>
                <span style="color: var(--brand);">₱${totalAmount}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-top: 0.3rem; font-size: 0.75rem;">
                <span style="font-weight: 600;">Payment Method:</span>
                <span style="font-weight: 600; text-transform: uppercase;">${paymentMethod}</span>
            </div>
        </div>
        <div style="text-align: center; font-size: 0.7rem; color: var(--text-secondary); margin-top: 0.8rem;">
            Thank you for choosing Katipunan Prime Badminton Center!
        </div>
    `;

    document.getElementById('receipt-content').innerHTML = receiptHTML;
    document.getElementById('receipt-modal').classList.remove('hidden');
};

// ---------- RECEIPT CONTROLS ----------
window.closeReceiptAndShowSuccess = function() {
    document.getElementById('receipt-modal').classList.add('hidden');
    document.getElementById('success-overlay').classList.remove('hidden');
};

window.closeReceipt = function() {
    document.getElementById('receipt-modal').classList.add('hidden');
    // Optionally, you can also show the success overlay here:
    document.getElementById('success-overlay').classList.remove('hidden');
};

window.printReceipt = function() {
    const receiptContent = document.getElementById('receipt-content').innerHTML;
    const bookingRef = document.getElementById('final-id').textContent;
    const win = window.open('', '_blank');
    win.document.write(`
        <html>
        <head>
            <title>Booking Receipt - ${bookingRef}</title>
            <style>
                body { font-family: 'Poppins', sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 2rem; }
                .header h1 { color: #0066ff; margin-bottom: 0.2rem; }
                .receipt-content { border-top: 2px solid #0066ff; padding-top: 1rem; }
                .footer { text-align: center; margin-top: 2rem; color: #666; font-size: 0.8rem; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>Katipunan Prime</h1>
                <p>52 Katipunan St., Marikina City</p>
                <p>Booking Receipt</p>
            </div>
            <div class="receipt-content">
                ${receiptContent}
            </div>
            <div class="footer">
                <p>This is an official receipt for your booking.</p>
                <p>Thank you for playing with us!</p>
            </div>
        </body>
        </html>
    `);
    win.document.close();
    win.focus();
    win.print();
};

// ---------- INITIALISE ON PAGE LOAD ----------
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    document.getElementById('receipt-modal')?.classList.add('hidden');

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const datePicker = document.getElementById('booking-date');
    if (datePicker) {
        datePicker.min = today.toISOString().split('T')[0];
        datePicker.value = tomorrow.toISOString().split('T')[0];
        booking.date = datePicker.value;
        datePicker.addEventListener('change', function() {
            booking.date = this.value;
        });
    }

    // Court selection
    document.querySelectorAll('.court-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.court-box').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            booking.court = this.dataset.court;
            showNotification(`Court ${booking.court} selected`, 'success');
        });
    });

    // Rate type
    const rateHourly = document.getElementById('rate-hourly');
    const rateAll = document.getElementById('rate-all');
    if (rateHourly) {
        rateHourly.addEventListener('click', function() {
            rateHourly.classList.add('active');
            rateAll.classList.remove('active');
            booking.rate = 'hourly';
            showNotification('Hourly rate selected (₱170/hour)', 'info');
        });
    }
    if (rateAll) {
        rateAll.addEventListener('click', function() {
            rateAll.classList.add('active');
            rateHourly.classList.remove('active');
            booking.rate = 'all';
            showNotification('Play-All rate selected (₱200 flat)', 'info');
        });
    }

    // Time slot
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            booking.time = this.dataset.time;
            showNotification(`Time slot: ${booking.time}`, 'success');
        });
    });

    // Payment method
    document.querySelectorAll('.pay-box').forEach(box => {
        box.addEventListener('click', function() {
            document.querySelectorAll('.pay-box').forEach(p => p.classList.remove('selected'));
            this.classList.add('selected');
            booking.paymentMethod = this.dataset.method;
            showNotification(`Payment method: ${this.dataset.method.toUpperCase()}`, 'info');
        });
    });

    // Auto-select first court & first time slot
    if (!booking.court) {
        const firstCourt = document.querySelector('.court-box');
        if (firstCourt) firstCourt.click();
    }
    if (!booking.time) {
        const firstTime = document.querySelector('.time-btn');
        if (firstTime) firstTime.click();
    }

    // Demo equipment (adjust as needed)
    booking.equip.racket = 2;
    booking.equip.shuttlecock = 2;
    booking.equip.water = 1;
    document.getElementById('q-racket').textContent = booking.equip.racket;
    document.getElementById('q-shuttlecock').textContent = booking.equip.shuttlecock;
    document.getElementById('q-water').textContent = booking.equip.water;

    const base = booking.rate === 'all' ? 200 : 340;
    const extras = (booking.equip.racket * 50) + (booking.equip.shuttlecock * 30) + (booking.equip.shoes * 80) + (booking.equip.water * 15);
    booking.total = base + extras; // 2 rackets, 2 shuttlecocks, 1 water = 100+60+15=175 → 340+175=515 (hourly) or 200+175=375 (all)
});

// ---------- NOTIFICATION ANIMATION ----------
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to   { transform: translateX(0); opacity: 1; }
    }
    .notification { font-family: 'Poppins', sans-serif; font-weight: 500; font-size: 14px; }
`;
document.head.appendChild(style);