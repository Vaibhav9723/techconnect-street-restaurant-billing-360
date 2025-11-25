# Firebase Authentication Setup Guide

## 📋 Prerequisites

1. A Firebase project (create one at https://console.firebase.google.com)
2. Firestore database enabled in your Firebase project

## 🔧 Step 1: Get Firebase Configuration

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll down to "Your apps" section
5. Click on the Web app (</>) icon
6. Copy the `firebaseConfig` object

## 🔐 Step 2: Configure Environment Variables

1. Create a `.env` file in the root directory (copy from `.env.example`)
2. Add your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## 📊 Step 3: Setup Firestore Database

### Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in production mode" (we'll update rules)
4. Select your preferred location
5. Click "Enable"

### Create Users Collection

Create a collection named `users` with the following structure:

#### Document ID: {userId} (Firebase Auth UID)

```json
{
  "email": "admin@example.com",
  "role": "admin",
  "active": true,
  "expiry": "2025-12-31",
  "deviceLimit": 3,
  "devices": []
}
```

#### Field Descriptions:

- **email**: User's email address (string)
- **role**: Either "admin" or "client" (string)
- **active**: Whether account is active (boolean)
- **expiry**: Account expiry date in YYYY-MM-DD format (string)
- **deviceLimit**: Maximum number of devices allowed (number)
- **devices**: Array of device IDs currently logged in (array)

### Firestore Security Rules

Update your Firestore rules to:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      // Users can read and update their own document
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 👥 Step 4: Create User Accounts

### Via Firebase Console:

1. Go to "Authentication" in Firebase Console
2. Click "Get Started"
3. Enable "Email/Password" sign-in method
4. Go to "Users" tab
5. Click "Add user"
6. Enter email and password
7. Copy the User UID

### Create Firestore Document:

1. Go to "Firestore Database"
2. Click on "users" collection
3. Click "Add document"
4. Use the User UID as Document ID
5. Add fields as shown above

## 🚀 Step 5: Start the Application

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `/login`

3. Use your created credentials to login

## 🔒 Security Features

✅ **Device Limit Control**: Prevents users from logging in on more devices than allowed

✅ **Account Expiry**: Automatically blocks access after expiry date

✅ **Active Status**: Admins can deactivate accounts

✅ **Role-Based Access**: 
- Admin → Full access to all POS features + admin dashboard
- Client → Access to POS features + client dashboard

✅ **Secure Logout**: Removes device from allowed devices list

✅ **Auto-Login**: Users stay logged in across page refreshes

## 📝 User Flow

### Login Process:
1. User enters email & password
2. System validates credentials with Firebase Auth
3. Fetches user document from Firestore
4. Checks: active status, expiry date, device limit
5. Adds device ID to user's devices array
6. Redirects to appropriate dashboard (admin/client)

### Logout Process:
1. Removes device ID from Firestore
2. Signs out from Firebase Auth
3. Clears local storage
4. Redirects to login page

## 🎯 Access Control

### Public Routes:
- `/login` - Login page (auto-redirects if already logged in)

### Admin Only:
- `/admin/dashboard` - Admin dashboard with navigation to all features

### Client Only:
- `/client/dashboard` - Client dashboard with limited access

### Protected (Both Admin & Client):
- `/` - POS Dashboard
- `/billing` - Billing page
- `/products` - Products management
- `/categories` - Categories management
- `/settings` - Settings page

## 🆘 Troubleshooting

### Error: "Failed to decrypt data"
- Your encryption password might be different from when data was encrypted
- Try logging out and logging in again

### Error: "Device limit reached"
- Maximum devices are already logged in
- Logout from another device or increase deviceLimit in Firestore

### Error: "Account expired"
- Update the expiry date in Firestore user document

### Login page not redirecting after login
- Check browser console for errors
- Verify Firebase configuration in .env
- Ensure Firestore user document exists with correct role

## 📚 Example Firestore Documents

### Admin User:
```json
{
  "email": "admin@myshop.com",
  "role": "admin",
  "active": true,
  "expiry": "2026-12-31",
  "deviceLimit": 5,
  "devices": []
}
```

### Client User:
```json
{
  "email": "client@customer.com",
  "role": "client",
  "active": true,
  "expiry": "2025-06-30",
  "deviceLimit": 2,
  "devices": []
}
```

## 🔄 Testing the System

1. Create a test admin user in Firebase Auth
2. Create corresponding Firestore document
3. Login at `/login`
4. Verify redirect to `/admin/dashboard`
5. Test logout functionality
6. Login again to verify device tracking
7. Create a client user and test client dashboard access

---

**Note**: Never commit your `.env` file to version control. The `.env.example` file is provided as a template.
