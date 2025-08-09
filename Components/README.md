# 📦 Components - Modules React de TimeTracker V4

## 📁 Structure des Composants

### 🌅 `/Background/` - Composants de Background
- **`DynamicBackground.tsx`** - Orchestrateur principal du background dynamique
- **`AstronomicalLayer.tsx`** - Couche astronomique (étoiles, lune)
- **`DiurnalLayer.tsx`** - Couche diurne (nuages)
- **`LoginBackground.tsx`** - Background de la page de connexion

### 🎨 `/UI/` - Composants d'Interface
- **`BackgroundInfo.tsx`** - ❌ DÉSACTIVÉ (plus d'automatisation)
- **`SlideFooter.tsx`** - Footer avec liens sociaux

### 🔧 **SIMPLIFICATION CISCO**
- ❌ **`/Context/`** - SUPPRIMÉ (plus de contextes GPS/temps)
- ❌ **`/Testing/`** - SUPPRIMÉ (plus de tests GPS)
- ❌ **`TimeSimulator.tsx`** - SUPPRIMÉ (plus de temps simulé)
- ❌ **`ControlButtonsWrapper.tsx`** - SUPPRIMÉ (remplacé par panneau intégré)

## 🔗 **Imports Simplifiés - Mode Manuel Uniquement**

```typescript
// Background - SEULS COMPOSANTS NÉCESSAIRES
import DynamicBackground from './Components/Background/DynamicBackground';
import AstronomicalLayer from './Components/Background/AstronomicalLayer';
import DiurnalLayer from './Components/Background/DiurnalLayer';

// UI - COMPOSANTS ACTIFS
import SlideFooter from './Components/UI/SlideFooter';

// Audio
import AmbientSoundManagerV2 from './Components/Audio/AmbientSoundManagerV2';

// 🔧 CISCO: SUPPRIMÉS
// ❌ Contextes (TimeContext, LocationContext)
// ❌ TimeSimulator, BackgroundInfo, ControlButtonsWrapper
// ❌ Composants de test GPS
```

## 📝 **Notes d'Organisation**

- **Logique métier** : Chaque dossier regroupe des composants par fonction
- **Dépendances** : Les composants peuvent s'importer entre eux
- **Performance** : Structure optimisée pour le tree-shaking
- **Maintenance** : Facilite la localisation et la modification des composants

---
*Structure créée le 2025-01-22 - Organisation modulaire*
