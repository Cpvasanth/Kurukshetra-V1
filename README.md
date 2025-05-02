# Firebase Studio

This is a NextJS starter project configured for Firebase Studio.

To get started, take a look at `src/app/page.tsx`.

## Environment Variables

This project uses Firebase for backend services like authentication and database. You **MUST** configure Firebase and set up environment variables for the application to function correctly.

**CRITICAL:** Failure to set the `NEXT_PUBLIC_FIREBASE_API_KEY` will cause the application to crash during initialization.

1.  **Create a Firebase Project:** Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project or use an existing one.
2.  **Register a Web App:** In your Firebase project settings, add a new Web app (+ Add app, select the Web icon `</>`).
3.  **Get Firebase Config:** After registering the app, Firebase will provide you with a configuration object (usually in a snippet under "Add Firebase SDK"). Copy the values from this object (`apiKey`, `authDomain`, `projectId`, etc.).
4.  **Create `.env.local` file:** Create a file named `.env.local` in the **root directory** of your project (the same level as `package.json`).
    *   **Important:** This file should **NOT** be committed to git (it's usually included in `.gitignore` by default).
5.  **Add Environment Variables:** Add the following variables to your `.env.local` file, replacing the `YOUR_...` placeholder values with your **actual** Firebase project configuration values obtained in step 3.

    ```env
    # --- Firebase Project Configuration (Required) ---
    # Get these values from your Firebase project settings > Web app config
    NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
    NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
    # NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional, for Analytics

    # --- Firebase Emulators (Optional - for local development) ---
    # Set to true to use local emulators instead of live Firebase services
    # NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
    # Set the host if your emulators are not running on 127.0.0.1
    # NEXT_PUBLIC_EMULATOR_HOST=127.0.0.1

    # --- Google AI / Genkit (Optional - for GenAI features) ---
    # Get this from Google AI Studio or Google Cloud Console
    # GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY
    ```

6.  **Restart Development Server:** If your development server (`npm run dev` or `yarn dev`) was running, **stop it (Ctrl+C) and restart it** to load the new environment variables from `.env.local`.

**Key Points:**

*   The `NEXT_PUBLIC_` prefix is **required** for these variables to be exposed to the browser in Next.js.
*   The `NEXT_PUBLIC_FIREBASE_API_KEY` is absolutely essential.
*   Ensure the `.env.local` file is in the project's root directory.
*   Always restart your development server after modifying `.env.local`.
