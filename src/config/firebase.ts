// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAqjY6xhvQXJYkkMyb113N8ZbAP3qScPHk",
  authDomain: "notarette-express.firebaseapp.com",
  projectId: "notarette-express",
  storageBucket: "notarette-express.firebasestorage.app",
  messagingSenderId: "713342449698",
  appId: "1:713342449698:web:02874947b350e6fc5ab27b",
  measurementId: "G-3NM3YMTRT3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, analytics, auth, db };
