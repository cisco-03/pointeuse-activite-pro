# 🆓 Mode Libre & 📦 Système d'Archivage - TimeTracker V4

## 📋 **Vue d'ensemble**

Deux nouvelles fonctionnalités majeures ont été ajoutées à l'application :

1. **Mode Libre** : Permet d'utiliser le chronomètre sans contraintes (agence/tâche)
2. **Système d'Archivage Local** : Export multi-format des sessions anciennes avec suppression optionnelle

---

## 🆓 **MODE LIBRE**

### **Fonctionnalités**
- ✅ Toggle "Mode libre" dans l'interface principale
- ✅ Démarrage du timer sans sélection d'agence obligatoire
- ✅ Démarrage du timer sans saisie de tâche obligatoire
- ✅ Compatible avec **chronomètre ET compte à rebours**
- ✅ Sauvegarde automatique avec valeurs par défaut

### **Comportement**
- **Mode libre activé** :
  - Champs agence/tâche désactivés visuellement
  - Placeholder adapté : "Tâche optionnelle (laissez vide pour 'Session libre')"
  - Création automatique de l'agence "Libre" si nécessaire
  - Tâche par défaut : "Session libre" si champ vide

- **Mode libre désactivé** :
  - Comportement classique (validation stricte)
  - Agence ET tâche obligatoires pour démarrer

### **Interface**
- Checkbox avec label "🆓 Mode libre"
- Badge informatif "Chronomètre sans contraintes" quand activé
- Désactivation visuelle des champs concernés
- Bordure teal sur le textarea en mode libre

---

## 📦 **SYSTÈME D'ARCHIVAGE LOCAL**

### **Fonctionnalités**
- ✅ Détection automatique des sessions anciennes (90+ jours)
- ✅ Export multi-format : **JSON, CSV, TXT, PDF**
- ✅ Sélection multiple des sessions à archiver
- ✅ Suppression optionnelle de Firebase après export
- ✅ Interface de confirmation sécurisée

### **Formats d'export**

#### **📄 JSON**
- Structure complète des données
- Timestamps en format ISO
- Idéal pour réimport/traitement programmatique

#### **📊 CSV**
- Compatible Excel/tableurs
- Colonnes : Date, Agence, Durée, Logs
- Encodage UTF-8

#### **📝 TXT**
- Format lisible partout
- Structure hiérarchique claire
- Horodatage français

#### **📋 PDF**
- Génération via impression HTML
- Mise en page professionnelle
- Ouverture automatique pour impression

### **Interface**
- Bouton "🗂️ Archiver" dans le header
- Panneau dédié avec liste des sessions anciennes
- Sélection individuelle ou globale
- Boutons d'export par format
- Modal de confirmation pour suppression

---

## 🔧 **IMPLÉMENTATION TECHNIQUE**

### **Fichiers modifiés**
- `App.tsx` : Logique principale, composants, hooks

### **Nouvelles fonctions**
- `getOldSessions()` : Détection sessions 90+ jours
- `exportToJSON()` : Export format JSON
- `exportToCSV()` : Export format CSV  
- `exportToTXT()` : Export format TXT
- `exportToPDF()` : Export format PDF (impression HTML)
- `deleteArchivedSessions()` : Suppression Firebase

### **Nouveaux composants**
- `ArchiveManagerPanel` : Interface de gestion des archives
- Toggle mode libre intégré dans l'interface principale

### **États ajoutés**
- `freeMode` : Activation du mode libre
- `showArchiveManager` : Affichage du gestionnaire d'archives

---

## 🎯 **UTILISATION**

### **Mode Libre**
1. Cocher "🆓 Mode libre" 
2. Cliquer "Démarrer" (agence/tâche optionnelles)
3. Le timer démarre immédiatement
4. Sauvegarde automatique avec "Libre" / "Session libre"

### **Archivage**
1. Cliquer "🗂️ Archiver" dans le header
2. Sélectionner les sessions à archiver
3. Choisir le format d'export (JSON/CSV/TXT/PDF)
4. Optionnel : Supprimer de Firebase après export

---

## ⚠️ **SÉCURITÉ**

- **Confirmation obligatoire** avant suppression Firebase
- **Export local** : Données sauvegardées sur le PC utilisateur
- **Pas de perte de données** : Export avant suppression
- **Réversibilité** : Possibilité d'annuler avant suppression

---

## 📈 **AVANTAGES**

### **Mode Libre**
- Flexibilité totale d'utilisation
- Pas de contraintes pour usage personnel
- Compatible avec tous les modes de timer

### **Archivage Local**
- **Indépendance** vis-à-vis de Firebase
- **Formats multiples** selon les besoins
- **Sauvegarde locale** sécurisée
- **Nettoyage** de la base de données

---

**Date d'implémentation :** 07/01/2025  
**Version :** TimeTracker V4.2  
**Statut :** ✅ PRODUCTION READY
