# LNMIIT Girls Hostel - Washing Machine Booking System

A complete web application for booking washing machines in LNMIIT Girls Hostel with user booking system and admin portal for machine management.

## Features

### For Students:
- 24/7 online booking system
- Real-time machine availability status
- View and manage personal bookings
- Cancel pending bookings
- User-friendly interface

### For Admins (Wardens):
- Machine status management (Available/In Use/Broken)
- View all bookings across all users
- Add new washing machines
- Admin dashboard with complete overview

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd washing_machine_booking
   ```

2. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Start the backend server:**
   ```bash
   python app.py
   ```
   The backend server will start on `http://localhost:5000`

4. **Open the frontend:**
   - Open `index.html` in your web browser
   - Or serve it using a simple HTTP server:
     ```bash
     python -m http.server 8000
     ```
   - Then visit `http://localhost:8000`

## Usage

### Default Admin Credentials
- **Admin ID:** `admin`
- **Password:** `admin123`

### For Students:
1. Click "Get Started" or "Login" on the homepage
2. Register with your LNMIIT Student ID and create a password
3. Login with your credentials
4. View available washing machines
5. Book a time slot by selecting machine, start time, and duration
6. View and manage your bookings in "My Bookings" section

### For Admins:
1. Click "Admin" button on the homepage
2. Login with admin credentials
3. Manage machine status (Available/In Use/Broken)
4. View all student bookings
5. Add new washing machines to the system

## File Structure

```
washing_machine_booking/
├── index.html          # Main frontend file
├── styles.css          # CSS styling
├── script.js           # Frontend JavaScript
├── app.py              # Flask backend server
├── requirements.txt    # Python dependencies
├── lnmiit_logo.png     # College logo
├── design_document.md  # System architecture documentation
└── README.md           # This file
```

## API Endpoints

### User Authentication
- `POST /api/register` - Register new student
- `POST /api/login` - Student login
- `POST /api/admin/login` - Admin login

### Machine Management
- `GET /api/machines` - Get all machines
- `GET /api/admin/machines` - Get machines with admin details
- `PUT /api/admin/machines/<id>/status` - Update machine status
- `POST /api/admin/machines` - Add new machine

### Booking Management
- `POST /api/bookings` - Create new booking
- `GET /api/bookings/user/<user_id>` - Get user's bookings
- `DELETE /api/bookings/<booking_id>` - Cancel booking
- `GET /api/admin/bookings` - Get all bookings (admin)

## Database Schema

The application uses SQLite database with three main tables:
- **users** - Student and admin accounts
- **washing_machines** - Machine information and status
- **bookings** - Booking records with time slots

## Features Implemented

✅ User registration and authentication
✅ Admin authentication and management
✅ Real-time machine status display
✅ Booking creation with conflict detection
✅ Booking cancellation
✅ Admin machine status management
✅ Admin booking overview
✅ Responsive design for mobile and desktop
✅ Modern UI with smooth animations
✅ LNMIIT branding and college logo

## Technical Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Backend:** Python Flask
- **Database:** SQLite
- **Styling:** Custom CSS with modern design principles
- **Icons:** Font Awesome
- **CORS:** Enabled for frontend-backend communication

## Security Features

- Password hashing using SHA-256
- Input validation and sanitization
- SQL injection prevention
- User session management
- Admin role-based access control

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Troubleshooting

1. **Backend not starting:**
   - Ensure Python and pip are installed
   - Install dependencies: `pip install -r requirements.txt`
   - Check if port 5000 is available

2. **Frontend not connecting to backend:**
   - Ensure backend server is running on port 5000
   - Check browser console for CORS errors
   - Verify API_BASE URL in script.js

3. **Database issues:**
   - Database file will be created automatically
   - Delete `washing_machine_booking.db` to reset database

## Future Enhancements

- Email notifications for bookings
- SMS alerts for booking reminders
- Machine usage analytics
- Maintenance scheduling
- Mobile app development
- Integration with college ID card system

## Support

For technical support or feature requests, contact the development team or submit issues through the appropriate channels.

---

**Developed for LNMIIT Girls Hostel**
*Making laundry booking easier, one click at a time!*

