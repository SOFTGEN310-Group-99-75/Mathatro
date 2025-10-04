import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAsodsLtIQcuhHqkAlDPZHU3DFEeHsp8PU",
  authDomain: "mathatro.firebaseapp.com",
  projectId: "mathatro",
  storageBucket: "mathatro.firebasestorage.app",
  messagingSenderId: "730963402265",
  appId: "1:730963402265:web:3b8d50a17dbb6d0f7b9488",
  measurementId: "G-PCBLWN1V7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Initialize Analytics and get a reference to the service
export const analytics = getAnalytics(app);

// Connect to emulators in development (optional)
if ((import.meta as any).env?.DEV) {
  // Uncomment these lines if you want to use Firebase emulators for development
  // connectAuthEmulator(auth, "http://localhost:9099");
  // connectFirestoreEmulator(db, 'localhost', 8080);
}

export default app;
