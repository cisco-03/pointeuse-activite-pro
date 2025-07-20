// src/firebase.ts

import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAnalytics, Analytics } from "firebase/analytics";
import { firebaseConfig } from "./firebase-config";

// --- Configuration Firebase ---
// Utilisation de la configuration importée depuis firebase-config.ts
// Cette approche fonctionne à la fois en développement et en production

// --- Initialisation des services Firebase ---
// On initialise l'application et on exporte les services dont on aura besoin.
const app: FirebaseApp = initializeApp(firebaseConfig);
const auth: Auth = getAuth(app);
const db: Firestore = getFirestore(app);
const analytics: Analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, analytics, googleProvider };


