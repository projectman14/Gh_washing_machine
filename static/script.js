// Global variables
let currentUser = null;
let isAdmin = false;
let machines = [];
let bookings = [];

// API Base URL
const API_BASE = 'https://gh-washing-machine-jt7u.onrender.com/api';

// DOM Elements
const loginModal = document.getElementById('loginModal');
const adminModal = document.getElementById('adminModal');
const welcomeSection = document.getElementById('welcomeSection');
const userDashboard = document.getElementById('userDashboard');
const adminDashboard = document.getElementById('adminDashboard');

// Google Sign-In Handler
function handleCredentialResponse(response) {
    try {
        // Check if Google Client ID is properly configured
        if (!response || !response.credential) {
            showMessage('Google Sign-In configuration error. Please contact administrator.', 'error');
            return;
        }
        
        // Decode the JWT token to get user info
        const responsePayload = decodeJwtResponse(response.credential);
        
        // Extract email - now allow any email domain
        const email = responsePayload.email;
        
        // Extract student ID from email (assuming format: studentid@domain.com)
        const studentId = email.split('@')[0];
        
        // Auto-register or login the user
        googleSignIn(response.credential);
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showMessage('Google Sign-In failed. Please use manual login instead.', 'error');
    }
}

function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

async function googleSignIn(token) {
    try {
        // First try to login
        const loginResponse = await fetch(`${API_BASE}/google-login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token })  // <-- ✅ Send token
        });

        if (loginResponse.ok) {
            const data = await loginResponse.json();
            currentUser = data.user;
            localStorage.setItem('currentUser', JSON.stringify(currentUser)); // <-- Persist user
            localStorage.setItem('isAdmin', 'false'); // <-- Persist role
            hideModal(loginModal);
            showUserDashboard();
            showMessage('Google Sign-In successful!', 'success');
        } else {
            // Try to register
            const registerResponse = await fetch(`${API_BASE}/google-register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token })  // <-- ✅ Send token again
            });

            if (registerResponse.ok) {
                const data = await registerResponse.json();
                currentUser = data.user;
                localStorage.setItem('currentUser', JSON.stringify(currentUser)); // <-- Persist user
                localStorage.setItem('isAdmin', 'false'); // <-- Persist role
                hideModal(loginModal);
                showUserDashboard();
                showMessage('Account created and logged in successfully!', 'success');
            } else {
                const errorData = await registerResponse.json();
                showMessage(errorData.message || 'Google Sign-In failed', 'error');
            }
        }
    } catch (error) {
        console.error('Google Sign-In error:', error);
        showMessage('Google Sign-In failed. Please try again.', 'error');
    }
}


// Initialize the application
document.addEventListener('DOMContentLoaded', async function() {
    initializeEventListeners();
    await checkAuthStatus();
    loadMachines();
});

// Event Listeners
function initializeEventListeners() {
    // Modal controls
    document.getElementById('loginBtn').addEventListener('click', () => showModal(loginModal));
    document.getElementById('adminBtn').addEventListener('click', () => showModal(adminModal));
    document.getElementById('getStartedBtn').addEventListener('click', () => showModal(loginModal));

    // Close modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            hideModal(e.target.closest('.modal'));
        });
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideModal(e.target);
        }
    });

    // Form submissions
    document.getElementById('adminForm').addEventListener('submit', handleAdminLogin);
    document.getElementById('bookingForm').addEventListener('submit', handleBooking);
    document.getElementById('addMachineForm').addEventListener('submit', handleAddMachine);
    document.getElementById('checkSlotsBtn').addEventListener('click', handleCheckSlots);

    // Logout buttons
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);
    document.getElementById('adminLogoutBtn').addEventListener('click', handleLogout);

    // Set minimum datetime for booking
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    document.getElementById('startTime').min = now.toISOString().slice(0, 16);
    
    // Set default date for slot checking to today
    document.getElementById('slotDate').value = now.toISOString().split('T')[0];

    // Admin toggle past bookings
    const togglePastBookingsBtn = document.getElementById("togglePastBookingsBtn");
    if (togglePastBookingsBtn) {
        togglePastBookingsBtn.addEventListener("click", () => {
            const button = document.getElementById("togglePastBookingsBtn");
            if (button.textContent === "Show Past Bookings") {
                button.textContent = "Hide Past Bookings";
                loadAllBookings(true);
            } else {
                button.textContent = "Show Past Bookings";
                loadAllBookings(false);
            }
        });
    }

    // Toggle Check Booked Slots section
    document.getElementById('toggleSlotsBtn').addEventListener('click', () => {
        const slotsContent = document.getElementById('slotsContent');
        const button = document.getElementById('toggleSlotsBtn');
        if (slotsContent.style.display === 'none' || slotsContent.style.display === '') {
            slotsContent.style.display = 'block';
            button.textContent = 'Hide';
        } else {
            slotsContent.style.display = 'none';
            button.textContent = 'Show';
        }
    });
}

// Modal functions
function showModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function hideModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Authentication functions
async function handleAdminLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const adminData = {
        admin_id: formData.get('adminId'),
        password: formData.get('adminPassword')
    };

    try {
        const response = await fetch(`${API_BASE}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(adminData)
        });

        const result = await response.json();
        
        if (response.ok) {
            currentUser = result.admin;
            isAdmin = true;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('isAdmin', 'true');
            hideModal(adminModal);
            showAdminDashboard();
            showMessage('Admin login successful!', 'success');
        } else {
            showMessage(result.message || 'Admin login failed', 'error');
        }
    } catch (error) {
        console.error('Admin login error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function handleLogout() {
    currentUser = null;
    isAdmin = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isAdmin');
    
    // Clear auto-refresh interval
    if (window.machineStatusInterval) {
        clearInterval(window.machineStatusInterval);
        window.machineStatusInterval = null;
    }
    
    showWelcomeSection();
    showMessage('Logged out successfully!', 'info');
}

async function checkAuthStatus() {
    try {
        const savedUser = localStorage.getItem('currentUser');
        const savedIsAdmin = localStorage.getItem('isAdmin');
        
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Validate that the user object has required properties
            if (parsedUser && parsedUser.id && parsedUser.username) {
                currentUser = parsedUser;
                isAdmin = savedIsAdmin === 'true';
                
                if (isAdmin) {
                    showAdminDashboard();
                } else {
                    await showUserDashboard();
                }
                return;
            }
        }
        
        // If no valid saved user, show welcome section
        showWelcomeSection();
    } catch (error) {
        console.error('Error checking auth status:', error);
        // Clear corrupted data and show welcome section
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isAdmin');
        currentUser = null;
        isAdmin = false;
        showWelcomeSection();
    }
}

// Dashboard functions
function showWelcomeSection() {
    welcomeSection.style.display = 'block';
    userDashboard.style.display = 'none';
    adminDashboard.style.display = 'none';
    
    // Clear auto-refresh interval
    if (window.machineStatusInterval) {
        clearInterval(window.machineStatusInterval);
        window.machineStatusInterval = null;
    }
}

async function showUserDashboard() {
    welcomeSection.style.display = 'none';
    userDashboard.style.display = 'block';
    adminDashboard.style.display = 'none';
    
    document.getElementById('userName').textContent = currentUser.username;
    loadUserBookings();
    await loadMachines(); // Wait for machines to load
    populateMachineSelect(); // Then populate the select with real-time status
    
    // Set up auto-refresh for machine status every 30 seconds
    if (window.machineStatusInterval) {
        clearInterval(window.machineStatusInterval);
    }
    window.machineStatusInterval = setInterval(async () => {
        await loadMachines();
        populateMachineSelect();
    }, 30000); // Refresh every 30 seconds
}

function showAdminDashboard() {
    welcomeSection.style.display = 'none';
    userDashboard.style.display = 'none';
    adminDashboard.style.display = 'block';
    
    // Clear auto-refresh interval (admin doesn\'t need real-time updates)
    if (window.machineStatusInterval) {
        clearInterval(window.machineStatusInterval);
        window.machineStatusInterval = null;
    }
    
    loadAdminMachines();
    loadAllBookings();
}

// Machine functions
async function loadMachines() {
    try {
        const response = await fetch(`${API_BASE}/machines`);
        const result = await response.json();
        
        if (response.ok) {
            machines = result.machines;
            displayMachines();
        } else {
            console.error('Failed to load machines:', result.message);
        }
    } catch (error) {
        console.error('Error loading machines:', error);
        // Show demo data if API is not available
        machines = [
            { id: 1, machine_name: 'Machine 1', status: 'available' },
            { id: 2, machine_name: 'Machine 2', status: 'in_use' },
            { id: 3, machine_name: 'Machine 3', status: 'available' },
            { id: 4, machine_name: 'Machine 4', status: 'broken' }
        ];
        displayMachines();
    }
}

// Check if a machine is currently in use based on current time and bookings
function getMachineCurrentStatus(machineStatus) {
    if (machineStatus === 'broken') {
        return { status: 'broken', text: 'OUT OF ORDER' };
    } else if (machineStatus === 'in_use') {
        return { status: 'in_use', text: 'CURRENTLY IN USE' };
    } else {
        return { status: 'available', text: 'CURRENTLY AVAILABLE' };
    }
}

function displayMachines() {
    const machineList = document.getElementById('machineList');
    if (!machineList) return;

    machineList.innerHTML = '';
    
    // Limit to only 8 machines
    const limitedMachines = machines.slice(0, 8);
    
    limitedMachines.forEach(machine => {
        // Use backend status only
        const currentStatus = getMachineCurrentStatus(machine.status);
        
        const machineCard = document.createElement('div');
        machineCard.className = `machine-card ${currentStatus.status}`;
        machineCard.innerHTML = `
            <div class="machine-header">
                <h4>${machine.machine_name}</h4>
                <div class="machine-status status-${currentStatus.status}">
                    ${currentStatus.text}
                </div>
            </div>
            <div class="machine-info">
                ${machine.last_used_by ? `<p><i class="fas fa-clock"></i> Last used: ${new Date(machine.last_used_time).toLocaleString()}</p>` : ''}
                <button class="btn-info btn-small" onclick="showMachineBookings(${machine.id}, '${machine.machine_name}')">
                    <i class="fas fa-calendar-alt"></i> View Bookings
                </button>
            </div>
        `;
        machineList.appendChild(machineCard);
    });
}

function populateMachineSelect() {
    const machineSelect = document.getElementById('machineSelect');
    if (!machineSelect) return;

    machineSelect.innerHTML = '<option value="">Choose a machine</option>';
    
    // Limit to only 8 machines and filter available ones based on real-time status
    const limitedMachines = machines.slice(0, 8);
    limitedMachines.forEach(machine => {
        const currentStatus = getMachineCurrentStatus(machine.status);
        // Only show machines that are currently available
        if (currentStatus.status === 'available') {
            const option = document.createElement('option');
            option.value = machine.id;
            option.textContent = machine.machine_name;
            machineSelect.appendChild(option);
        }
    });
}

// Booking functions
async function handleBooking(e) {
    e.preventDefault();
    
    // Check if user is still logged in
    if (!currentUser || !currentUser.id) {
        showMessage('Please login again to make a booking', 'error');
        handleLogout();
        return;
    }
    
    const formData = new FormData(e.target);
    
    const startTime = new Date(formData.get('startTime'));
    const duration = parseFloat(formData.get('duration')); // Use parseFloat to handle 0.5 hours
    const endTime = new Date(startTime.getTime() + duration * 60 * 60 * 1000);
    
    const bookingData = {
        machine_id: parseInt(formData.get('machineId')),
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString()
    };

    try {
        const response = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentUser.id}`
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage('Booking created successfully!', 'success');
            // Refresh data without affecting user session
            await loadUserBookings();
            await loadMachines();
            e.target.reset();
        } else {
            // Check if it\'s an authentication error
            if (response.status === 401 || response.status === 403) {
                showMessage('Session expired. Please login again.', 'error');
                handleLogout();
            } else {
                showMessage(result.message || 'Booking failed', 'error');
            }
        }
    } catch (error) {
        console.error('Booking error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

async function loadUserBookings() {
    if (!currentUser) return;

    try {
        const response = await fetch(`${API_BASE}/bookings/user/${currentUser.id}`);
        const result = await response.json();
        
        if (response.ok) {
            displayUserBookings(result.bookings);
        } else {
            console.error('Failed to load bookings:', result.message);
        }
    } catch (error) {
        console.error('Error loading bookings:', error);
        // Show demo data if API is not available
        displayUserBookings([
            {
                id: 1,
                machine_name: 'Machine 1',
                start_time: '2025-06-25T10:00:00',
                end_time: '2025-06-25T12:00:00',
                status: 'confirmed'
            }
        ]);
    }
}

function displayUserBookings(userBookings) {
    const bookingsContainer = document.getElementById('userBookings');
    if (!bookingsContainer) return;

    if (userBookings.length === 0) {
        bookingsContainer.innerHTML = '<p>No bookings found.</p>';
        return;
    }

    bookingsContainer.innerHTML = '';
    
    userBookings.forEach(booking => {
        const bookingCard = document.createElement('div');
        bookingCard.className = 'booking-card';
        bookingCard.innerHTML = `
            <div class="booking-info">
                <div>
                    <strong>${booking.machine_name}</strong>
                </div>
                <div>
                    ${new Date(booking.start_time).toLocaleString()} - 
                    ${new Date(booking.end_time).toLocaleString()}
                </div>
                <div class="booking-status status-${booking.status}">
                    ${booking.status.toUpperCase()}
                </div>
                ${booking.status === 'pending' ? `
                    <button class="btn-danger btn-small" onclick="cancelBooking(${booking.id})">
                        Cancel
                    </button>
                ` : ''}
            </div>
        `;
        bookingsContainer.appendChild(bookingCard);
    });
}

async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
        const response = await fetch(`${API_BASE}/bookings/${bookingId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${currentUser.id}`
            }
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage('Booking cancelled successfully!', 'success');
            loadUserBookings();
            loadMachines();
        } else {
            showMessage(result.message || 'Failed to cancel booking', 'error');
        }
    } catch (error) {
        console.error('Cancel booking error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Slot checking functions
async function handleCheckSlots() {
    const selectedDate = document.getElementById('slotDate').value;
    
    if (!selectedDate) {
        showMessage('Please select a date', 'error');
        return;
    }
    
    console.log('Checking slots for date:', selectedDate); // Debug log
    
    try {
        const response = await fetch(`${API_BASE}/bookings/date/${selectedDate}`);
        const result = await response.json();
        
        console.log('API response:', result); // Debug log
        
        if (response.ok) {
            displaySlots(result.bookings, selectedDate);
        } else {
            console.error('API error:', result.message);
            showMessage(result.message || 'Failed to load slots', 'error');
        }
    } catch (error) {
        console.error('Error loading slots:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function displaySlots(bookings, selectedDate) {
    const slotsDisplay = document.getElementById('slotsDisplay');
    if (!slotsDisplay) return;

    console.log('Displaying slots for', selectedDate, ':', bookings); // Debug log

    if (!bookings || bookings.length === 0) {
        slotsDisplay.innerHTML = `<p class="no-slots">No bookings found for ${formatDate(selectedDate)}</p>`;
        return;
    }

    // Group bookings by machine
    const bookingsByMachine = {};
    // Initialize all machines for the current date as available
    machines.forEach(machine => {
        bookingsByMachine[machine.machine_name] = [];
    });

    bookings.forEach(booking => {
        if (bookingsByMachine[booking.machine_name]) {
            bookingsByMachine[booking.machine_name].push(booking);
        }
    });

    slotsDisplay.innerHTML = `
        <h4>Bookings for ${formatDate(selectedDate)}</h4>
        <div class="machines-slots">
            ${Object.keys(bookingsByMachine).map(machineName => `
                <div class="machine-slot-group">
                    <h5 class="machine-title">${machineName}</h5>
                    <div class="slots-list">
                        ${bookingsByMachine[machineName].length > 0 ? 
                            bookingsByMachine[machineName].map(booking => `
                                <div class="slot-item" onclick="showSlotDetails(${JSON.stringify(booking).replace(/"/g, '&quot;')})">
                                    <span class="slot-time">${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}</span>
                                    <span class="slot-user">${booking.username}</span>
                                    <span class="slot-status ${booking.status}">${booking.status}</span>
                                </div>
                            `).join('')
                            : '<p class="no-slots-machine">No bookings for this machine on this date.</p>'
                        }
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function showSlotDetails(booking) {
    // Create modal if it doesn\'t exist
    let modal = document.getElementById('slotDetailsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'slotDetailsModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2>Booking Details</h2>
                <div id="slotDetailsContent">
                    <!-- Details will be loaded here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector('.close').addEventListener('click', () => {
            hideModal(modal);
        });
        
        // Close modal on outside click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    }
    
    // Update content
    const detailsContent = document.getElementById('slotDetailsContent');
    detailsContent.innerHTML = `
        <div class="booking-details-card">
            <div class="detail-row">
                <strong>Booking ID:</strong> #${booking.id}
            </div>
            <div class="detail-row">
                <strong>Student Name:</strong> ${booking.username}
            </div>
            <div class="detail-row">
                <strong>Student ID:</strong> ${booking.student_id}
            </div>
            <div class="detail-row">
                <strong>Machine:</strong> ${booking.machine_name}
            </div>
            <div class="detail-row">
                <strong>Date:</strong> ${formatDate(booking.start_time)}
            </div>
            <div class="detail-row">
                <strong>Time:</strong> ${formatTime(booking.start_time)} - ${formatTime(booking.end_time)}
            </div>
            <div class="detail-row">
                <strong>Duration:</strong> ${calculateDuration(booking.start_time, booking.end_time)}
            </div>
            <div class="detail-row">
                <strong>Status:</strong> <span class="status-badge ${booking.status}">${booking.status}</span>
            </div>
            <div class="detail-row">
                <strong>Booked on:</strong> ${formatDateTime(booking.created_at)}
            </div>
        </div>
    `;
    
    showModal(modal);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function formatTime(dateTimeString) {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function calculateDuration(startTime, endTime) {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
        const diffMinutes = diffMs / (1000 * 60);
        return `${diffMinutes.toFixed(0)} minutes`;
    } else {
        return `${diffHours.toFixed(1)} hours`;
    }
}

async function loadAdminMachines() {
    try {
        const response = await fetch(`${API_BASE}/admin/machines`);
        const result = await response.json();
        
        if (response.ok) {
            displayAdminMachines(result.machines);
        } else {
            console.error("Failed to load admin machines:", result.message);
        }
    } catch (error) {
        console.error("Error loading admin machines:", error);
        // Show demo data if API is not available
        displayAdminMachines([
            { id: 1, machine_name: "Machine 1", status: "available" },
            { id: 2, machine_name: "Machine 2", status: "in_use" },
            { id: 3, machine_name: "Machine 3", status: "available" },
            { id: 4, machine_name: "Machine 4", status: "broken" }
        ]);
    }
}

function displayAdminMachines(adminMachines) {
    const adminMachineList = document.getElementById("adminMachineList");
    if (!adminMachineList) return;

    // Update status summary
    updateMachineStatusSummary(adminMachines);

    adminMachineList.innerHTML = "";
    
    adminMachines.forEach(machine => {
        const machineCard = document.createElement("div");
        machineCard.className = "admin-machine-card";
        machineCard.innerHTML = `
            <div class="machine-info">
                <h4>${machine.machine_name}</h4>
                <span class="machine-status status-${machine.status}">
                    ${machine.status.replace("_", " ").toUpperCase()}
                </span>
                ${machine.last_used_by_name ? `
                    <p class="last-used">Last used by: ${machine.last_used_by_name}</p>
                    <p class="last-used-time">Time: ${formatDateTime(machine.last_used_time)}</p>
                ` : ""}
            </div>
            <div class="machine-controls">
                <button class="btn-success btn-small ${machine.status === "available" ? "active" : ""}" 
                        onclick="updateMachineStatus(event, ${machine.id}, 'available')">
                    <i class="fas fa-check"></i> Available
                </button>
                <button class="btn-warning btn-small ${machine.status === "in_use" ? "active" : ""}" 
                        onclick="updateMachineStatus(event, ${machine.id}, 'in_use')">
                    <i class="fas fa-play"></i> In Use
                </button>
                <button class="btn-danger btn-small ${machine.status === "broken" ? "active" : ""}" 
                        onclick="updateMachineStatus(event, ${machine.id}, 'broken')">
                    <i class="fas fa-times"></i> Broken
                </button>
            </div>
        `;
        adminMachineList.appendChild(machineCard);
    });
}

function updateMachineStatusSummary(machines) {
    const statusCounts = {
        available: 0,
        in_use: 0,
        broken: 0
    };
    
    machines.forEach(machine => {
        if (statusCounts.hasOwnProperty(machine.status)) {
            statusCounts[machine.status]++;
        }
    });
    
    document.getElementById("availableCount").textContent = statusCounts.available;
    document.getElementById("inUseCount").textContent = statusCounts.in_use;
    document.getElementById("brokenCount").textContent = statusCounts.broken;
}

async function updateMachineStatus(event, machineId, status) {
    // Get machine name for confirmation
    const machineCard = event.target.closest(".admin-machine-card");
    const machineName = machineCard.querySelector("h4").textContent;
    
    const statusText = status.replace("_", " ").toLowerCase();
    if (!confirm(`Are you sure you want to mark ${machineName} as ${statusText}?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/admin/machines/${machineId}/status`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.id}`
            },
            body: JSON.stringify({ status })
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage(`${machineName} status updated to ${statusText} successfully!`, "success");
            loadAdminMachines();
            loadMachines();
        } else {
            showMessage(result.message || "Failed to update machine status", "error");
        }
    } catch (error) {
        console.error("Update machine status error:", error);
        showMessage("Network error. Please try again.", "error");
    }
}

async function handleAddMachine(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const machineData = {
        machine_name: formData.get("machineName")
    };

    try {
        const response = await fetch(`${API_BASE}/admin/machines`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${currentUser.id}`
            },
            body: JSON.stringify(machineData)
        });

        const result = await response.json();
        
        if (response.ok) {
            showMessage("Machine added successfully!", "success");
            loadAdminMachines();
            loadMachines();
            e.target.reset();
        } else {
            showMessage(result.message || "Failed to add machine", "error");
        }
    } catch (error) {
        console.error("Add machine error:", error);
        showMessage("Network error. Please try again.", "error");
    }
}

async function loadAllBookings(showPast = false) {
    try {
        const response = await fetch(`${API_BASE}/admin/bookings?show_past=${showPast}`);
        const result = await response.json();
        
        if (response.ok) {
            displayAllBookings(result.bookings);
        } else {
            console.error("Failed to load all bookings:", result.message);
        }
    } catch (error) {
        console.error("Error loading all bookings:", error);
        // Show demo data if API is not available
        displayAllBookings([
            {
                id: 1,
                username: "John Doe",
                student_id: "20BCS001",
                machine_name: "Machine 1",
                start_time: "2025-06-25T10:00:00",
                end_time: "2025-06-25T12:00:00",
                status: "confirmed"
            }
        ]);
    }
}

function displayAllBookings(allBookings) {
    const allBookingsContainer = document.getElementById("allBookings");
    if (!allBookingsContainer) return;

    if (allBookings.length === 0) {
        allBookingsContainer.innerHTML = "<p>No bookings found.</p>";
        return;
    }

    allBookingsContainer.innerHTML = "";
    
    allBookings.forEach(booking => {
        const bookingCard = document.createElement("div");
        bookingCard.className = "booking-card";
        bookingCard.innerHTML = `
            <div class="booking-info">
                <div>
                    <strong>${booking.username}</strong><br>
                    <small>${booking.student_id}</small>
                </div>
                <div>
                    <strong>${booking.machine_name}</strong>
                </div>
                <div>
                    ${new Date(booking.start_time).toLocaleString()} - 
                    ${new Date(booking.end_time).toLocaleString()}
                </div>
                <div class="booking-status status-${booking.status}">
                    ${booking.status.toUpperCase()}
                </div>
            </div>
        `;
        allBookingsContainer.appendChild(bookingCard);
    });
}

// Utility functions
function showMessage(message, type = "info") {
    // Remove existing messages
    const existingMessages = document.querySelectorAll(".message");
    existingMessages.forEach(msg => msg.remove());

    // Create new message
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${type}`;
    messageDiv.textContent = message;

    // Insert at the top of the main content
    const main = document.querySelector(".main");
    main.insertBefore(messageDiv, main.firstChild);

    // Auto remove after 5 seconds
    setTimeout(() => {
        messageDiv.remove();
    }, 5000);
}

// Refresh data periodically
setInterval(() => {
    if (currentUser) {
        loadMachines();
        if (isAdmin) {
            loadAdminMachines();
            const toggleBtn = document.getElementById("togglePastBookingsBtn");
            if (toggleBtn) {
                loadAllBookings(toggleBtn.textContent === "Hide Past Bookings");
            } else {
                loadAllBookings(false);
            }
        } else {
            loadUserBookings();
        }
    }
}, 30000); // Refresh every 30 seconds


async function showMachineBookings(machineId, machineName) {
    try {
        const response = await fetch(`${API_BASE}/machines/${machineId}/bookings?show_past=false`);
        const result = await response.json();
        
        if (response.ok) {
            displayMachineBookingsModal(result.machine_name, result.bookings);
        } else {
            showMessage(result.message || "Failed to load machine bookings", "error");
        }
    } catch (error) {
        console.error("Error loading machine bookings:", error);
        showMessage("Network error. Please try again.", "error");
    }
}

function displayMachineBookingsModal(machineName, bookings) {
    // Create modal if it doesn\'t exist
    let modal = document.getElementById("machineBookingsModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "machineBookingsModal";
        modal.className = "modal";
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close">&times;</span>
                <h2 id="machineBookingsTitle">Machine Bookings</h2>
                <div id="machineBookingsList" class="bookings-list">
                    <!-- Bookings will be loaded here -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add close functionality
        modal.querySelector(".close").addEventListener("click", () => {
            hideModal(modal);
        });
        
        // Close modal on outside click
        modal.addEventListener("click", (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    }
    
    // Update content
    document.getElementById("machineBookingsTitle").textContent = `${machineName} - Current Bookings`;
    const bookingsList = document.getElementById("machineBookingsList");
    
    if (bookings.length === 0) {
          bookingsList.innerHTML = "<p class=\"no-bookings\">No current bookings for this machine.</p>";
    } else {
        bookingsList.innerHTML = bookings.map(booking => `
            <div class="booking-item">
                <div class="booking-header">
                    <h4>Booking #${booking.id}</h4>
                    <span class="status-badge ${booking.status}">${booking.status}</span>
                </div>
                <div class="booking-details">
                    <p><i class="fas fa-user"></i> <strong>Student:</strong> ${booking.username} (${booking.student_id})</p>
                    <p><i class="fas fa-clock"></i> <strong>Time:</strong> ${formatDateTime(booking.start_time)} - ${formatDateTime(booking.end_time)}</p>
                    <p><i class="fas fa-calendar"></i> <strong>Booked on:</strong> ${formatDateTime(booking.created_at)}</p>
                </div>
            </div>
        `).join("");
    }
    
    showModal(modal);
}

function formatDateTime(dateTimeString) {
    if (!dateTimeString) return "N/A";
    const date = new Date(dateTimeString);
    return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}






