import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCv0qZmIfGHkmxjZS5-I2vYwppLC29Y7Qc",
  authDomain: "skill-forge-df7fc.firebaseapp.com",
  projectId: "skill-forge-df7fc",
  storageBucket: "skill-forge-df7fc.firebasestorage.app",
  messagingSenderId: "49514286150",
  appId: "1:49514286150:web:1aae8e81b328f7e2664e47",
  measurementId: "G-GZNVBXXFLE"
};

// Initialize Firebase only if it hasn't been initialized yet (avoids Next.js HMR issues)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);

export { app, auth, googleProvider, db };
