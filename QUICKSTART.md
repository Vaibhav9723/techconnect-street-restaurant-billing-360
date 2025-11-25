# 🚀 Quick Start Guide - Firebase Authentication

## ⚡ Fast Setup (5 Minutes)

### Step 1: Add Firebase Environment Variables

Create a `.env` file in the root directory with your Firebase config:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### Step 2: Setup Firestore Database

1. Enable Firestore in your Firebase project
2. Create a collection named `users`
3. Add a test user document:

**Document ID:** (Use the Firebase Auth UID)

```json
{
  "email": "admin@test.com",
  "role": "admin",
  "active": true,
  "expiry": "2026-12-31",
  "deviceLimit": 3,
  "devices": []
}
```

### Step 3: Create Firebase Auth User

1. Go to Firebase Console → Authentication
2. Enable Email/Password authentication
3. Add a user with email: `admin@test.com` and password of your choice
4. Copy the User UID and use it as the Document ID in step 2

### Step 4: Restart the Application

```bash
# The application will automatically restart when .env is saved
# Or manually restart using:
npm run dev
```

### Step 5: Login

1. Navigate to `/login`
2. Enter email: `admin@test.com`
3. Enter your password
4. You'll be redirected to `/admin/dashboard`

---

## ✅ What's Implemented

### 🔐 Authentication Features
- ✅ Email/Password login
- ✅ Password show/hide toggle
- ✅ Loading states
- ✅ Error handling
- ✅ Auto-redirect after login
- ✅ Secure logout

### 👥 Role-Based Access Control
- ✅ **Admin Role**: Full access to all POS features
- ✅ **Client Role**: Limited access to POS features
- ✅ Auto-redirect based on role

### 🛡️ Security Features
- ✅ **Device Limit Control**: Max devices per user
- ✅ **Account Expiry**: Automatic access blocking after expiry
- ✅ **Active Status**: Manual account enable/disable
- ✅ **Protected Routes**: No unauthorized access
- ✅ **Persistent Login**: Auto-login on page refresh

### 📱 Routes

#### Public Routes
- `/login` - Login page

#### Admin Routes
- `/admin/dashboard` - Admin dashboard with full navigation

#### Client Routes
- `/client/dashboard` - Client dashboard with limited access

#### Protected Routes (Both Admin & Client)
- `/` - POS Dashboard
- `/billing` - Billing page
- `/products` - Products management
- `/categories` - Categories management
- `/settings` - Settings page

---

## 🎯 Login Flow

```
User enters credentials
        ↓
Firebase Authentication
        ↓
Fetch user from Firestore
        ↓
Check: active, expiry, deviceLimit
        ↓
    Success?
    ↙     ↘
  Yes      No
   ↓        ↓
Add device  Show error
   ↓        ↓
Redirect   Logout
to dashboard
```

---

## 🔧 Troubleshooting

### Error: "Firebase: Error (auth/invalid-api-key)"
**Solution:** Add your Firebase config to `.env` file

### Error: "User data not found"
**Solution:** Create a Firestore document for the user in `users` collection

### Error: "Device limit reached"
**Solution:** 
- Logout from another device, OR
- Increase `deviceLimit` in Firestore user document

### Login page shows blank screen
**Solution:** 
- Check browser console for errors
- Verify all environment variables are set
- Restart the development server

---

## 📖 Detailed Documentation

For complete Firebase setup instructions, see: [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)

---

## 🎨 Features Not Affected

All your existing POS features work exactly as before:
- ✅ Product management
- ✅ Category management
- ✅ Billing system
- ✅ Settings
- ✅ Encrypted local storage
- ✅ Theme customization
- ✅ Dark mode

The authentication is a **protective layer** on top of your existing features!
