# 📦 Components - Modules React de TimeTracker V4

## 📁 Structure des Composants

### 🌅 `/Background/` - Composants de Background
- **`DynamicBackground.tsx`** - Orchestrateur principal du background dynamique
- **`AstronomicalLayer.tsx`** - Couche astronomique (étoiles, lune)
- **`DiurnalLayer.tsx`** - Couche diurne (nuages)
- **`LoginBackground.tsx`** - Background de la page de connexion

### 🕐 `/Context/` - Contextes React
- **`TimeContext.tsx`** - Gestion du temps (réel/simulé)
- **`LocationContext.tsx`** - Gestion de la géolocalisation GPS

### 🎨 `/UI/` - Composants d'Interface
- **`BackgroundInfo.tsx`** - Affichage des informations de background
- **`TimeSimulator.tsx`** - Simulateur de temps pour tests

### 🧪 `/Testing/` - Composants de Test
- **`LocationTestButton.tsx`** - Bouton de test de localisation
- **`LocationTester.tsx`** - Testeur complet de géolocalisation

## 🔗 **Imports Recommandés**

```typescript
// Background
import DynamicBackground from './Components/Background/DynamicBackground';
import AstronomicalLayer from './Components/Background/AstronomicalLayer';

// Context
import { TimeProvider, useTime } from './Components/Context/TimeContext';
import { LocationProvider, useLocation } from './Components/Context/LocationContext';

// UI
import TimeSimulator from './Components/UI/TimeSimulator';
import BackgroundInfo from './Components/UI/BackgroundInfo';

// Testing
import LocationTestButton from './Components/Testing/LocationTestButton';
```

## 📝 **Notes d'Organisation**

- **Logique métier** : Chaque dossier regroupe des composants par fonction
- **Dépendances** : Les composants peuvent s'importer entre eux
- **Performance** : Structure optimisée pour le tree-shaking
- **Maintenance** : Facilite la localisation et la modification des composants

---
*Structure créée le 2025-01-22 - Organisation modulaire*
