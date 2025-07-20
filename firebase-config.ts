// Configuration Firebase sécurisée
// Utilise les variables d'environnement pour éviter l'exposition des clés dans le code source

// Validation des variables d'environnement
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!import.meta.env[envVar]) {
    throw new Error(`Variable d'environnement manquante: ${envVar}. Vérifiez votre fichier .env`);
  }
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

// Debug : Afficher la configuration (en mode développement uniquement)
if (import.meta.env.DEV) {
  console.log('🔧 Configuration Firebase chargée:', {
    apiKey: firebaseConfig.apiKey ? `${firebaseConfig.apiKey.substring(0, 10)}...` : 'MANQUANTE',
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    hasAllKeys: Object.values(firebaseConfig).every(value => value !== undefined)
  });
}

// Note: Les variables d'environnement sont chargées depuis le fichier .env
// Assurez-vous que .env est dans votre .gitignore pour éviter l'exposition des clés
