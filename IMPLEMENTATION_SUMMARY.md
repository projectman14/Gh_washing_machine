# LNMIIT Girls Hostel - Washing Machine Booking System
## Implementation Summary

### ✅ Completed Features

#### 1. Google Authentication Only
- **Removed** traditional login/registration forms
- **Only Google Sign-In** is available for students
- **Domain restriction** to @lnmiit.ac.in emails only
- Automatic user registration on first Google login

#### 2. Slot Checking Feature
- **Date-wise slot viewing** - Select any date to see all bookings
- **Click on slots** to view detailed user information
- **Real-time booking status** display
- **User-friendly date selector** with today as default

#### 3. 2-Hour Maximum Booking Limit
- **Frontend duration options**: 30 min, 1 hour, 1.5 hours, 2 hours
- **Backend validation** enforces 2-hour maximum
- **Error messages** for duration violations

#### 4. Email Notification System
- **Booking confirmation emails** sent automatically
- **Cancellation notification emails** 
- **Professional HTML email templates**
- **Environment variable configuration** for security
- **Graceful fallback** when email not configured

#### 5. Enhanced Admin Portal
- **Machine status summary** cards (Available, In Use, Broken)
- **Improved machine management** with confirmation dialogs
- **Visual status indicators** with icons
- **Last used information** display
- **Active button states** for current status

#### 6. Additional Improvements
- **Better error handling** throughout the system
- **Responsive design** for mobile and desktop
- **Professional UI/UX** improvements
- **Security enhancements** with environment variables

### 🚀 How to Run

1. **Install Dependencies**:
   ```bash
   pip3 install -r requirements.txt
   pip3 install google-auth google-auth-oauthlib google-auth-httplib2
   ```

2. **Set Email Configuration** (Optional):
   ```bash
   export EMAIL_USER="your-gmail@gmail.com"
   export EMAIL_PASSWORD="your-app-password"
   ```

3. **Run the Application**:
   ```bash
   python3 app.py
   ```

4. **Access the System**:
   - Student Portal: http://localhost:5000
   - Admin Login: Use admin/admin123

### 📧 Email Setup
See `EMAIL_SETUP.md` for detailed email configuration instructions.

### 🔐 Admin Credentials
- **Username**: admin
- **Password**: admin123

### 🎯 Key Changes Made

1. **Authentication**: Only Google Sign-In for students
2. **Slot Checking**: Date-wise booking view with user details
3. **Duration Limit**: Maximum 2 hours per booking
4. **Email Notifications**: Automatic booking confirmations
5. **Admin Portal**: Enhanced machine status management
6. **Security**: Environment variables for sensitive data
7. **UI/UX**: Professional design improvements

### 📱 Features Overview

#### For Students:
- Google Sign-In with LNMIIT email
- View machine availability
- Check booked slots by date
- Book machines (max 2 hours)
- View personal booking history
- Receive email confirmations

#### For Admin/Warden:
- Machine status management (Available/In Use/Broken)
- View all bookings
- Machine usage statistics
- Add new machines
- Real-time status updates

### 🔧 Technical Stack
- **Backend**: Flask with SQLite database
- **Frontend**: HTML, CSS, JavaScript
- **Authentication**: Google OAuth 2.0
- **Email**: SMTP with Gmail
- **Deployment**: Ready for production deployment

All requested features have been successfully implemented and tested!

