# 🏗️ Architecture Système - TimeTracker V4

## 📊 Vue d'ensemble technique

### 🎯 **Application de Pointeuse d'Activité Professionnelle**
- **Framework** : React 19.1.0 + TypeScript
- **Build Tool** : Vite.js
- **Styling** : Tailwind CSS + shadcn/ui
- **Animations** : GSAP 3.13.0 + CSS Keyframes
- **3D/Astronomie** : SunCalc 1.9.0
- **Backend** : Firebase 12.0.0
- **Déploiement** : Netlify

## 🌅 **Système de Background Dynamique**

### Composants principaux :
1. **`DynamicBackground.tsx`** - Orchestrateur principal
   - Gestion des dégradés de ciel (9 phases solaires)
   - Calcul de luminosité du paysage
   - Synchronisation temps réel/simulé
   - Animations GSAP pour transitions fluides

2. **`AstronomicalLayer.tsx`** - Couche astronomique
   - Affichage progressif de 400 étoiles
   - Calcul de visibilité selon phases solaires
   - Animation de scintillement GSAP
   - Gestion de la lune et ses phases

3. **`DiurnalLayer.tsx`** - Couche diurne
   - Animation de 42 nuages (4 types différents)
   - CSS Keyframes pures (pas de GSAP)
   - Dispersion temporelle optimisée

## 🕐 **Système de Temps**

### Contextes :
- **`TimeContext.tsx`** : Gestion temps réel/simulé
- **`LocationContext.tsx`** : Géolocalisation GPS
- **`TimeSimulator.tsx`** : Outil de test des phases

### Calculs astronomiques :
- **SunCalc** pour positions solaires précises
- **9 phases solaires** : Nuit → Aube → Lever → Midi → Coucher → Crépuscule
- **Synchronisation GPS** pour calculs localisés

### 🆕 **Détection Automatique au Démarrage** :
- **Auto-détection** de l'heure du PC au chargement de l'application
- **Calculs précis** avec géolocalisation (SunCalc) si disponible
- **Fallback intelligent** sur l'heure locale si pas de GPS
- **Re-synchronisation** automatique quand la géolocalisation devient disponible
- **Contrôle manuel** toujours disponible via le panneau de contrôle

## 🎨 **Système d'Animation**

### GSAP (Animations complexes) :
- Transitions de dégradés (2s, power2.inOut)
- Luminosité du paysage synchronisée
- Scintillement des étoiles
- Zoom contemplatif du background (95s cycle)

### CSS Keyframes (Animations simples) :
- Mouvement des nuages (400-700s cycles)
- Optimisations GPU avec transform3d

## 🔄 **Flux de Données**

```
GPS Location → SunCalc → Solar Phase → Colors/Brightness → GSAP Animation
     ↓              ↓           ↓            ↓              ↓
TimeContext → getCurrentTime() → Phase Logic → Visual Update → DOM
```

## 🚀 **Optimisations Performance**

### GPU Acceleration :
- `force3D: true` sur toutes animations GSAP
- `willChange: transform, filter` sur éléments animés
- `transform: translateZ(0)` pour forcer GPU

### Gestion Mémoire :
- Nettoyage des timelines GSAP (`timeline.kill()`)
- Suppression des event listeners
- Optimisation des re-renders React

---
*Dernière mise à jour : 2025-01-22*
