# Firebase Setup Guide

To enable authentication in the Mathatro game, we need to set up a Firebase project and configure the authentication.

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

1. Copy the `.env.example` file to create a new `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Open the `.env` file and replace the placeholder values with your actual Firebase configuration:

   ```
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-actual-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
   VITE_FIREBASE_APP_ID=your-actual-app-id
   VITE_FIREBASE_MEASUREMENT_ID=your-actual-measurement-id
   ```

3. **Important**: The `.env` file contains sensitive credentials and should never be committed to version control. It's already listed in `.gitignore`.

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
- Check that your `.env` file exists and contains the correct Firebase configuration values
- Ensure all environment variables start with `VITE_` prefix (required by Vite)
- If you get "Property 'env' does not exist" errors, restart your TypeScript server or reload VS Code
- Ensure your domain is authorized in Firebase Authentication settings (for production)

## Security Notes

- **Never commit the `.env` file** to version control - it contains your actual API keys
- The `.env.example` file is safe to commit as it only contains placeholders
- For production deployments, set environment variables through your hosting platform (Vercel, Netlify, etc.)
- The Firebase API key is safe to expose in client-side code but should still be kept in `.env` for easier management

## Features Included

- User registration with email and password
- User login with email and password
- User profile display in the game UI
- Logout functionality
- Persistent authentication state
- Error handling for common authentication issues
