import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase project config - grabbed from console
const firebaseConfig = {
  apiKey: "AIzaSyAsodsLtIQcuhHqkAlDPZHU3DFEeHsp8PU",
  authDomain: "mathatro.firebaseapp.com",
  projectId: "mathatro",
  storageBucket: "mathatro.firebasestorage.app",
  messagingSenderId: "730963402265",
  appId: "1:730963402265:web:3b8d50a17dbb6d0f7b9488",
  measurementId: "G-PCBLWN1V7P"
};

// Boot up Firebase
const app = initializeApp(firebaseConfig);

// Auth for login/signup
export const auth = getAuth(app);

// Firestore DB for storing user data
export const db = getFirestore(app);

// Analytics to track user behavior
export const analytics = getAnalytics(app);

// Dev mode: uncomment to use local emulators instead of prod Firebase
if ((import.meta as any).env?.DEV) {
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
