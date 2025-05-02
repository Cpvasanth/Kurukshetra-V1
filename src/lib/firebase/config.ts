// src/lib/firebase/config.ts

// Ensure environment variables are loaded (especially in non-Next.js environments if applicable)
// In Next.js, variables starting with NEXT_PUBLIC_ are automatically available client-side

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

export function getFirebaseConfig() {
  // CRITICAL check for the API key
  if (!firebaseConfig.apiKey) {
    console.error("Firebase Config Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing!");
    console.error("Please ensure the `.env.local` file is created in the project root and contains the `NEXT_PUBLIC_FIREBASE_API_KEY` variable with your Firebase Web API Key.");
    console.error("After adding the key, restart your development server.");
    throw new Error(
      'Missing Firebase API Key. Ensure NEXT_PUBLIC_FIREBASE_API_KEY environment variable is set correctly.'
    );
  }

  // Check other essential fields and warn if missing
  const essentialKeys: (keyof typeof firebaseConfig)[] = [
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];
  const missingKeys = essentialKeys.filter(key => !firebaseConfig[key]);

  if (missingKeys.length > 0) {
     console.warn(
       `Firebase Config Warning: Optional but recommended configuration variables are missing: ${missingKeys.map(k => `NEXT_PUBLIC_FIREBASE_${k.replace(/([A-Z])/g, '_$1').toUpperCase()}`).join(', ')}. Check your .env.local file.`
     );
  }

  return firebaseConfig;
}
