'use client'; // Ensure this runs only on the client

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, browserLocalPersistence, setPersistence, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore'; // If using Firestore
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions'; // If using Functions
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage'; // If using Storage
import { getFirebaseConfig } from './config';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let functions: Functions | null = null;
let storage: FirebaseStorage | null = null;
let firebaseInitializationError: Error | null = null;

try {
  // Initialize Firebase
  const firebaseConfig = getFirebaseConfig(); // This now throws if API key is missing
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app); // Initialize Firestore
  functions = getFunctions(app); // Initialize Functions
  storage = getStorage(app); // Initialize Storage


  // --- Emulator Setup (Optional, for local development) ---
  const useEmulator = process.env.NODE_ENV === 'development' && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === 'true';
  const host = process.env.NEXT_PUBLIC_EMULATOR_HOST || '127.0.0.1'; // Default to localhost

  if (useEmulator) {
    console.log(`Firebase Client: Using Emulators on host: ${host}`);

    // Check if emulators are already connected to prevent errors on HMR
    // Note: Firebase JS SDK doesn't provide a direct 'isConnected' check for emulators.
    // We connect eagerly, potential harmless warnings on HMR are acceptable.

    // Connect Auth Emulator (Port 9099)
    // IMPORTANT: Must happen before setPersistence
    console.log(`Connecting to Auth Emulator: http://${host}:9099`);
    connectAuthEmulator(auth, `http://${host}:9099`, { disableCors: true });

    // Connect Firestore Emulator (Port 8080)
     console.log(`Connecting to Firestore Emulator: http://${host}:8080`);
     connectFirestoreEmulator(db, host, 8080);

     // Connect Functions Emulator (Port 5001)
     console.log(`Connecting to Functions Emulator: http://${host}:5001`);
     connectFunctionsEmulator(functions, host, 5001);

     // Connect Storage Emulator (Port 9199)
     console.log(`Connecting to Storage Emulator: http://${host}:9199`);
     connectStorageEmulator(storage, host, 9199);

  } else {
     console.log("Firebase Client: Connecting to Production Firebase services.");
     // Set persistence for production builds (run this *after* potential emulator connection)
     setPersistence(auth, browserLocalPersistence)
       .then(() => {
         console.log("Firebase Auth persistence set to browserLocalPersistence.");
       })
       .catch((error) => {
         console.error("Firebase Client: Error setting Auth persistence:", error);
       });
  }
  // --- End Emulator Setup ---

} catch (error: any) {
    firebaseInitializationError = error; // Store the error
    console.error("!!! FIREBASE INITIALIZATION FAILED !!!");
    console.error("Ensure your `.env.local` file exists in the project root and contains the correct Firebase configuration variables (especially NEXT_PUBLIC_FIREBASE_API_KEY). Restart the development server after creating or modifying the file.");
    console.error("Error Code:", error.code);
    console.error("Error Message:", error.message);
    // Don't re-throw here immediately, allow exports but they will be null/throw later if used
}

// Export initialized services or null/error if init failed
export { app, auth, db, functions, storage, firebaseInitializationError };

// Optional: Helper function to check initialization status
export function isFirebaseInitialized(): boolean {
  return app !== null && !firebaseInitializationError;
}
