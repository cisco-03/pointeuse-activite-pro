// Configuration Firebase sécurisée
// Utilise les variables d'environnement pour éviter l'exposition des clés dans le code source

// Liste des variables requises (exposées côté client via préfixe VITE_)
export const requiredFirebaseEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
] as const;
export type FirebaseEnvKey = typeof requiredFirebaseEnvVars[number];

// Validation des variables d'environnement (testable)
export function validateFirebaseEnv(env: Record<string, unknown>): void {
  for (const key of requiredFirebaseEnvVars) {
    const value = (env as any)?.[key];
    if (typeof value !== 'string' || value.length === 0) {
      throw new Error(`Variable d'environnement manquante: ${key}. Vérifiez votre fichier .env`);
    }
  }
}

// Valider au chargement du module (runtime app)
if ((import.meta as any)?.env?.MODE !== 'test') {
  validateFirebaseEnv(import.meta.env as any);
}

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Debug : Afficher la configuration (DEV uniquement)
if (import.meta.env.MODE !== 'production') {
  // ⚠️ Ne jamais afficher la clé complète en console
  console.log('🔧 Configuration Firebase chargée:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 8)}...` : 'MANQUANTE',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    currentDomain: typeof window !== 'undefined' ? window.location.hostname : 'SSR',
    hasAllKeys: Object.values(firebaseConfig).every(value => value !== undefined),
    environment: import.meta.env.MODE
  });
}

// Note: Les variables d'environnement sont chargées depuis le fichier .env / .env.local
// Assurez-vous que ces fichiers sont listés dans .gitignore (déjà configuré)
