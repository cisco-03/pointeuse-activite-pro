// src/firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";

// --- Validation des variables d'environnement ---
// On s'assure que toutes les clés sont bien présentes avant de continuer.
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID',
  'VITE_FIREBASE_MEASUREMENT_ID',
];

for (const varName of requiredEnvVars) {
  if (!import.meta.env[varName]) {
    // Si une clé manque, on arrête tout et on affiche une erreur claire.
    throw new Error(`Erreur critique: La variable d'environnement ${varName} est manquante. Veuillez vérifier votre fichier .env.local et redémarrer le serveur.`);
  }
}

// --- Configuration Firebase ---
// On utilise les clés validées pour configurer Firebase.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// --- Initialisation des services Firebase ---
// On initialise l'application et on exporte les services dont on aura besoin.
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const analytics: Analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, analytics, googleProvider };


