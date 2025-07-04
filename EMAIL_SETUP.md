# Email Notification Setup

## Gmail Configuration

To enable email notifications for booking confirmations, you need to configure Gmail SMTP settings.

### Step 1: Create Gmail App Password

1. Go to your Google Account settings
2. Navigate to Security > 2-Step Verification
3. Enable 2-Step Verification if not already enabled
4. Go to Security > App passwords
5. Generate a new app password for "Mail"
6. Copy the generated 16-character password

### Step 2: Set Environment Variables

Before running the application, set these environment variables:

```bash
export EMAIL_USER="your-gmail@gmail.com"
export EMAIL_PASSWORD="your-16-character-app-password"
```

Or create a `.env` file in the project directory:

```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
```

### Step 3: Update Email Configuration (Optional)

If you want to use a different email service, update the following in `app.py`:

```python
EMAIL_HOST = 'smtp.gmail.com'  # Change for other providers
EMAIL_PORT = 587               # Change for other providers
EMAIL_FROM = 'Your Name <your-email@domain.com>'
```

### Step 4: Test Email Functionality

The application will automatically send email notifications when:
- A student successfully books a washing machine slot
- The booking is confirmed

If email credentials are not configured, the system will log a message but continue to function normally.

## Troubleshooting

1. **Authentication Error**: Make sure you're using an App Password, not your regular Gmail password
2. **Connection Error**: Check your internet connection and firewall settings
3. **Email Not Received**: Check spam folder and verify the recipient email address

## Security Notes

- Never commit email credentials to version control
- Use environment variables or secure configuration management
- Consider using OAuth2 for production environments
- Regularly rotate app passwords for security

