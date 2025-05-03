# Next.js + Firebase Starter

A minimal starter template for integrating Firebase with a Next.js application.

> 📂 To begin, check out [`src/app/page.tsx`](src/app/page.tsx)

---

## 🚀 Setup Instructions

To run this project successfully, you must configure Firebase and set up the required environment variables.

### ✅ 1. Create a Firebase Project

- Visit the [Firebase Console](https://console.firebase.google.com/).
- Create a new project or use an existing one.

### 🌐 2. Register a Web App

- In your Firebase project settings, click **"Add App"** and select the **Web (`</>`)** icon.
- After registration, Firebase will provide a configuration object containing your project credentials.

### 🧾 3. Add Environment Variables

Create a `.env.local` file in the **root directory** of your project (same level as `package.json`) and populate it with your Firebase config values:

```env
# --- Firebase Configuration (Required) ---
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
# NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID # Optional

# --- Firebase Emulators (Optional) ---
# NEXT_PUBLIC_USE_FIREBASE_EMULATOR=false
# NEXT_PUBLIC_EMULATOR_HOST=127.0.0.1

# --- Google AI / Genkit (Optional) ---
# GOOGLE_GENAI_API_KEY=YOUR_GOOGLE_AI_API_KEY
```

> ⚠️ **Important:** Do not commit `.env.local` to version control. It should already be listed in `.gitignore`.

### 🔄 4. Restart the Development Server

After creating or modifying `.env.local`, restart the dev server to apply changes:

```bash
# Stop the running server
Ctrl + C

# Restart the development server
npm run dev
# or
yarn dev
```

---

## ⚠️ Notes

- All environment variables intended for use in the browser **must** start with `NEXT_PUBLIC_`.
- `NEXT_PUBLIC_FIREBASE_API_KEY` is **required**; the app will fail to load without it.
- The `.env.local` file must be in the project root.
- Always restart the dev server after changing env variables.

---

## 💡 Project Overview

This project is a **sports results and schedule viewing website** with an **admin dashboard**, powered by **Firebase Authentication**. The admin dashboard allows you to manage sports schedules, results, and team data, while Firebase Authentication ensures secure user logins.

---

## 👨‍💻 Author

**Vasanthakumar C**  
Blockchain Developer | React & Next.js Enthusiast  

📫 [Connect on LinkedIn](https://www.linkedin.com/in/cpvasanth/)  
📁 Portfolio: _coming soon_
