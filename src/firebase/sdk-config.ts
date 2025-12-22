// This file is for your Firebase SDK configuration.
//
// You can get this data from the Firebase console. In your project settings,
// find the "SDK setup and configuration" section and click "Config".
//
// Configuration is loaded from environment variables for security.
// Set these in .env.local for local development and in Vercel for production.

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyCjMSpm8FbBxUZ9ZRjt_7nDbAHlnw8g0QI",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "studio-4972782117-39fa2.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-4972782117-39fa2",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "studio-4972782117-39fa2.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "601096056382",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:601096056382:web:05389fdcbcf3ab2e7deb6f",
};
