// firebase/config.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Am adăugat importul pentru Storage

// Acum citim cheile în mod securizat din variabilele de mediu
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initializează Firebase
let app;
if (getApps().length === 0) {
  // Verificăm dacă cheia API există. Dacă nu, oprim aplicația cu o eroare.
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase config is missing. Make sure .env.local is set up correctly.");
  }
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Acum putem fi siguri că 'app' există, deci 'db' și 'auth' nu vor fi niciodată null.
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app); // Am inițializat serviciul de Storage

export { db, auth, storage }; // Am exportat și 'storage'
