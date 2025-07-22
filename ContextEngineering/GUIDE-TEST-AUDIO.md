# 🎵 Guide de Test - Système Audio Amélioré

## 🔍 **TESTS À EFFECTUER**

### ✅ **1. Mixage Simultané par Période**

#### 🌙 **Nuit Profonde**
- **Sons attendus** : Criquets (continu) + Hibou (périodique)
- **Test** : Sélectionner "🌌 Nuit profonde" dans le panneau de contrôle
- **Résultat** : Vous devez entendre les deux sons en même temps

#### 🌞 **Matin** 
- **Sons attendus** : Chants d'oiseaux + Bourdonnement d'insectes
- **Test** : Sélectionner "🌞 Matin" 
- **Résultat** : Ambiance matinale riche avec oiseaux et insectes

#### 🌇 **Après-midi**
- **Sons attendus** : Insectes d'été + Chants d'oiseaux
- **Test** : Sélectionner "🌇 Après-midi"
- **Résultat** : Atmosphère estivale avec insectes et oiseaux

#### 🌆 **Coucher de Soleil**
- **Sons attendus** : Grillons + Pépiements d'oiseaux
- **Test** : Sélectionner "🌆 Coucher du soleil"
- **Résultat** : Transition vers la soirée avec grillons et derniers chants

#### 🌃 **Crépuscule**
- **Sons attendus** : Merle + Grillon unique
- **Test** : Sélectionner "🌃 Crépuscule"
- **Résultat** : Ambiance douce de fin de journée

### ✅ **2. Normalisation Audio**

#### 🔊 **Volumes Équilibrés**
- **Hibou** : Plus doux (0.8x) pour ne pas dominer
- **Bourdonnement d'insectes** : Réduit (0.7x) pour rester en arrière-plan
- **Cigales** : Plus fort (1.2x) car naturellement plus audibles
- **Grillon unique** : Très doux (0.6x) pour ambiance subtile

#### 🎚️ **Test de Cohérence**
1. Passer d'une période à l'autre
2. Vérifier que les volumes sont cohérents
3. Aucun son ne doit être trop fort ou trop faible

### ✅ **3. Fonctionnalités Générales**

#### 🔄 **Audio Activé par Défaut**
- **Test** : Recharger la page (F5)
- **Résultat** : L'audio doit être activé automatiquement

#### 🌍 **Bouton Actualiser Intelligent**
- **Test** : Cliquer sur "🔄 Actualiser" dans les contrôles avancés
- **Résultat** : Synchronisation selon votre position géographique

## 📊 **CONFIGURATION TECHNIQUE**

### 🎼 **Mixage Simultané Activé**
```
✅ Nuit : criquets + hibou
✅ Matin : oiseaux + insectes  
✅ Après-midi : insectes d'été + oiseaux
✅ Coucher : grillons + pépiements
✅ Crépuscule : merle + grillon
```

### 🔇 **Pas de Mixage (1 seul fichier)**
```
⚪ Aube : coqs de village uniquement
⚪ Lever : merle noir uniquement  
⚪ Midi : cigales uniquement
```

### 🎚️ **Facteurs de Normalisation**
```
Hibou : 0.8x (plus doux)
Bourdonnement : 0.7x (arrière-plan)
Cigales : 1.2x (plus audible)
Grillon unique : 0.6x (très subtil)
Coqs : 0.9x (modéré)
Merle : 1.1x (bien audible)
```

## 🐛 **PROBLÈMES POTENTIELS**

### ⚠️ **Si un son ne se charge pas**
- Vérifier la console (F12) pour les erreurs
- Vérifier que les fichiers MP3 existent dans `/public/sounds/`

### ⚠️ **Si le mixage ne fonctionne pas**
- Vérifier que `mixingMode: 'simultaneous'` est configuré
- Vérifier les logs dans la console

### ⚠️ **Si les volumes sont déséquilibrés**
- Ajuster les facteurs dans `AUDIO_NORMALIZATION`
- Tester avec différents niveaux de volume global
