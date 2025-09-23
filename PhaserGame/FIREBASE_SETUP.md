# Firebase Setup Guide

To enable authentication in your Mathatro game, you need to set up a Firebase project and configure the authentication.

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter a project name (e.g., "mathatro-game")
4. Follow the setup wizard

## Step 2: Enable Authentication

1. In your Firebase project, go to "Authentication" in the left sidebar
2. Click "Get started"
3. Go to the "Sign-in method" tab
4. Enable "Email/Password" authentication

## Step 3: Configure Firebase in Your Game

1. In your Firebase project, go to "Project Settings" (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select the web icon (`</>`)
4. Register your app with a nickname (e.g., "mathatro-web")
5. Copy the Firebase configuration object

## Step 4: Update Firebase Configuration

Open `src/config/firebase.ts` and replace the placeholder values with your actual Firebase configuration:

```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-actual-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-actual-sender-id",
  appId: "your-actual-app-id"
};
```

## Step 5: Install Dependencies

Run the following command to install Firebase:

```bash
npm install
```

## Step 6: Test the Authentication

1. Start your development server: `npm run dev`
2. You should see the login screen when you first load the game
3. Try creating a new account and logging in

## Security Rules (Optional)

For production, you may want to set up Firestore security rules. In the Firebase Console:

1. Go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development
4. Set up security rules as needed for production

## Troubleshooting

- Make sure your Firebase project has Authentication enabled
- Verify that Email/Password sign-in method is enabled
- Check that your Firebase configuration values are correct
- Ensure your domain is authorized in Firebase Authentication settings (for production)

## Features Included

- User registration with email and password
- User login with email and password
- User profile display in the game UI
- Logout functionality
- Persistent authentication state
- Error handling for common authentication issues
