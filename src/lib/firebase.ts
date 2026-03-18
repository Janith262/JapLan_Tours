import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

if (typeof window !== "undefined") {
  (window as any).FIREBASE_CONFIG_DEBUG = {
    hasApiKey: !!firebaseConfig.apiKey,
    apiKeyLength: firebaseConfig.apiKey?.length,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    authDomain: firebaseConfig.authDomain,
    envKeys: Object.keys(import.meta.env).filter(k => k.startsWith("VITE_FIREBASE"))
  };
}

if (!firebaseConfig.apiKey) {
  console.error("Firebase API Key is missing!");
} else {
  console.log("Firebase Init Debug:", (window as any).FIREBASE_CONFIG_DEBUG);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable persistence
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code == 'failed-precondition') {
      console.warn("Firestore persistence failed: Multiple tabs open.");
    } else if (err.code == 'unimplemented') {
      console.warn("Firestore persistence failed: Browser doesn't support it.");
    }
  });
}

export const storage = getStorage(app);
