# 🔒 Guide de Sécurité - TimeTracker V4

## Configuration des Variables d'Environnement

### Fichiers Importants
- `.env` - Variables d'environnement locales (NE PAS COMMITER)
- `.env.example` - Template pour les développeurs
- `.gitignore` - Exclut les fichiers sensibles du contrôle de version

### Configuration Initiale
1. Copiez `.env.example` vers `.env`
2. Remplacez les valeurs par vos vraies clés Firebase
3. Vérifiez que `.env` est dans votre `.gitignore`

### Variables Firebase Requises
```
VITE_FIREBASE_API_KEY=votre_clé_api
VITE_FIREBASE_AUTH_DOMAIN=votre_domaine.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=votre_projet_id
VITE_FIREBASE_STORAGE_BUCKET=votre_bucket.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
VITE_FIREBASE_APP_ID=votre_app_id
VITE_FIREBASE_MEASUREMENT_ID=votre_measurement_id
```

## Sécurité Firebase

### Restrictions API Configurées
- ✅ Restrictions par domaine (localhost, netlify)
- ✅ Limitation aux applications web uniquement
- ✅ Clés API avec restrictions appropriées

### Bonnes Pratiques
1. **Jamais** commiter de clés API dans le code
2. Utiliser des variables d'environnement pour toutes les configurations sensibles
3. Régénérer les clés API si elles sont exposées
4. Configurer les règles de sécurité Firebase appropriées

## Déploiement Netlify

### Variables d'Environnement Netlify
Configurez ces variables dans votre dashboard Netlify :
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

### Domaines Autorisés
Assurez-vous que votre domaine Netlify est ajouté aux restrictions API Firebase.

## En Cas de Compromission
1. Révoquez immédiatement les clés exposées dans Google Cloud Console
2. Générez de nouvelles clés avec des restrictions appropriées
3. Mettez à jour vos variables d'environnement
4. Vérifiez les logs d'accès Firebase pour détecter tout usage suspect
