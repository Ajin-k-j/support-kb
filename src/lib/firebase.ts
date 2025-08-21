import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAe87Jlt_VqH37cgVrljoalB93aLzQaBPc",
  authDomain: "hdsupnext.firebaseapp.com",
  projectId: "hdsupnext",
  storageBucket: "hdsupnext.firebasestorage.app",
  messagingSenderId: "557294820830",
  appId: "1:557294820830:web:5a376e286aa54d479e514f",
  measurementId: "G-KQNG341Q1N"
};

// Initialize Firebase only if not already initialized (for hot reloads)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };