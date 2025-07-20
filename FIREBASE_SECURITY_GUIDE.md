# 🔐 Guide de Sécurité Firebase - Pointeuse d'Activité Pro

## ✅ Configuration Actuelle de Sécurité

### Variables d'Environnement
- ✅ `.env` est dans `.gitignore` (ligne 16)
- ✅ Variables préfixées `VITE_` (exposées côté client uniquement)
- ✅ Pas de clés secrètes dans le code

### Restrictions API Key Recommandées

#### 🌐 Pour la Production (Netlify)
```
Restrictions d'application:
- Domaines web: https://votre-app.netlify.app
- Domaines de référence: *.netlify.app

APIs autorisées:
- Firebase Authentication API
- Cloud Firestore API
- Firebase Analytics API (optionnel)
```

#### 🏠 Pour le Développement Local (Temporaire)
```
Restrictions d'application:
- Domaines web: http://localhost:*
- Domaines de référence: localhost

⚠️ À SUPPRIMER après développement !
```

## 🔧 Actions à Effectuer

### 1. Console Firebase (console.firebase.google.com)
1. Aller dans **Paramètres du projet** > **Général**
2. Cliquer sur l'icône ⚙️ de votre app web
3. Dans **Restrictions de clé API** :
   - Supprimer les IPs locales
   - Ajouter uniquement le domaine Netlify

### 2. Console Google Cloud (console.cloud.google.com)
1. Aller dans **APIs et services** > **Identifiants**
2. Cliquer sur votre clé API
3. Dans **Restrictions d'application** :
   - Sélectionner "Référents HTTP"
   - Ajouter : `https://votre-app.netlify.app/*`
   - Ajouter : `https://*.netlify.app/*` (pour les previews)

### 3. Règles Firestore Sécurisées
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Seuls les utilisateurs authentifiés peuvent accéder à leurs données
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Sous-collections (agencies, sessions, etc.)
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
    
    // Interdire tout autre accès
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## 🚨 Points de Vigilance

### ❌ Ce qui est NORMAL et SÉCURISÉ
- Les clés API Firebase sont visibles côté client
- C'est le comportement normal de Firebase
- La sécurité vient des règles Firestore et des domaines autorisés

### ⚠️ Ce qui doit être PROTÉGÉ
- Domaines autorisés (uniquement Netlify en prod)
- Règles Firestore strictes
- Pas d'APIs sensibles activées

## 📋 Checklist de Déploiement

- [ ] Clé API restreinte au domaine Netlify uniquement
- [ ] IPs de développement supprimées
- [ ] Règles Firestore configurées
- [ ] Variables d'environnement configurées sur Netlify
- [ ] Test de l'authentification en production
- [ ] Vérification des logs d'erreur

## 🔗 Liens Utiles

- [Console Firebase](https://console.firebase.google.com)
- [Console Google Cloud](https://console.cloud.google.com)
- [Documentation Sécurité Firebase](https://firebase.google.com/docs/projects/api-keys)
- [Règles Firestore](https://firebase.google.com/docs/firestore/security/get-started)

---
**Note**: Ce guide est spécifique à votre projet. Gardez-le à jour selon vos besoins.
