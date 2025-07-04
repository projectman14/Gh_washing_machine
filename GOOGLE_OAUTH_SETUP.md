# Google OAuth Setup Instructions

## To Fix Google Sign-In Authorization Error

The Google Sign-In feature requires proper OAuth configuration. Follow these steps:

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API (or Google Identity API)

### 2. Create OAuth 2.0 Credentials
1. Go to "Credentials" in the left sidebar
2. Click "Create Credentials" → "OAuth 2.0 Client IDs"
3. Choose "Web application" as the application type
4. Add your domain to "Authorized JavaScript origins":
   - For local development: `http://localhost:5000`
   - For production: `https://yourdomain.com`
5. Add redirect URIs if needed
6. Save and copy the Client ID

### 3. Update the Code
1. Open `index.html`
2. Find line 47: `data-client_id="YOUR_GOOGLE_CLIENT_ID_HERE"`
3. Replace `YOUR_GOOGLE_CLIENT_ID_HERE` with your actual Google Client ID

### 4. Test the Integration
1. Save the changes
2. Restart your application
3. Try Google Sign-In with an @lnmiit.ac.in email address

### Alternative Solution
If you don't want to set up Google OAuth, you can:
1. Remove the Google Sign-In section from `index.html` (lines 37-62)
2. Users can still register and login manually using the form

### Important Notes
- Only @lnmiit.ac.in email addresses are allowed
- The student ID is extracted from the email (part before @)
- Google Sign-In will auto-register users if they don't exist

