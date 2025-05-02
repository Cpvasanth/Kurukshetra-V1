'use client'; // Ensure this runs only on the client

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'; // If using Firestore
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions'; // If using Functions
import { getStorage, connectStorageEmulator } from 'firebase/storage'; // If using Storage
import { getFirebaseConfig } from './config';

// Initialize Firebase
const firebaseConfig = getFirebaseConfig();
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app); // If using Firestore
const functions = getFunctions(app); // If using Functions
const storage = getStorage(app); // If using Storage


// --- Emulator Setup (Optional, for local development) ---
// Check if running in development and if emulator host is set
const useEmulator = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_EMULATOR_HOST;

if (useEmulator) {
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || '127.0.0.1'; // Default to localhost
  console.log(`Using Firebase Emulators on host: ${host}`);

  // Point auth to the emulator
  // Note: Make sure the Auth emulator is running on port 9099
  // Important: Auth emulator connection MUST happen before trying to set persistence
  connectAuthEmulator(auth, `http://${host}:9099`, { disableCors: true });


  // Point other services to their emulators (adjust ports as needed)
   connectFirestoreEmulator(db, host, 8080);
   connectFunctionsEmulator(functions, host, 5001);
   connectStorageEmulator(storage, host, 9199);

} else {
   console.log("Connecting to production Firebase services.");
   // Ensure persistence is set for production if needed (after potential emulator connection)
    setPersistence(auth, browserLocalPersistence)
     .then(() => {
       // Persistence set successfully
       console.log("Firebase Auth persistence set to local.");
     })
     .catch((error) => {
       console.error("Error setting Firebase Auth persistence:", error);
     });
}
// --- End Emulator Setup ---


export { app, auth, db, functions, storage }; // Export initialized services
