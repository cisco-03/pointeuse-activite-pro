# 🎵 Système Audio Ambiant - TimeTracker V4

## 📋 Vue d'ensemble

Le système audio ambiant de TimeTracker V4 fournit une expérience sonore immersive qui s'adapte automatiquement aux différentes heures de la journée. Il utilise de vrais fichiers audio organisés par périodes et implémente des transitions fluides avec des fondus d'entrée et de sortie configurables.

## 🗂️ Structure des fichiers audio

```
public/sounds/
├── nuit-profonde/          # 🌃 Nuit profonde (00h-05h)
│   ├── hibou-molkom.mp3
│   └── night-atmosphere-with-crickets-374652.mp3
├── aube/                   # 🌅 Aube (05h-07h)
│   └── village_morning_birds_roosters.mp3
├── lever-soleil/           # 🌇 Lever de soleil (07h-09h)
│   └── blackbird.mp3
├── matin/                  # 🌄 Matin (09h-12h)
│   ├── insect_bee_fly.mp3
│   └── morning-birdsong.mp3
├── midi/                   # ☀️ Midi (12h-14h)
│   └── forest_cicada.mp3
├── apres-midi/             # 🌤️ Après-midi (14h-18h)
│   ├── birds-singing.mp3
│   └── summer-insects-243572.mp3
├── coucher-soleil/         # 🌆 Coucher de soleil (18h-20h)
│   ├── bird-chirp.mp3
│   └── grillon-drome.mp3
└── crepuscule/             # 🌙 Crépuscule (20h-00h)
    ├── cricket-single.mp3
    └── merle-blackbird.mp3
```

## 🎛️ Composants

### `AmbientSoundManager.tsx`
Le gestionnaire principal qui :
- 🔄 **Cross-fade intelligent** : Transitions fluides entre les sons
- 🔁 **Boucles automatiques** : Lecture continue sans coupure
- ⏱️ **Fondus configurables** : Durées d'entrée/sortie adaptées par période
- 🛡️ **Gestion d'erreurs** : Fallback automatique en cas de problème
- 📊 **Optimisation mémoire** : Reset des audio objects après usage

### `AudioControlPanel.tsx`
Interface utilisateur pour :
- 🔊 **Contrôle volume** : Slider avec feedback visuel
- ⏯️ **Activation/Désactivation** : Toggle principal
- 📊 **Informations temps réel** : Affichage du son actuel
- 🔧 **Diagnostic intégré** : Bouton d'accès aux tests

### `AudioDiagnostic.tsx`
Outil de diagnostic pour :
- ✅ **Test automatique** : Vérification de tous les fichiers audio
- 📊 **Rapport détaillé** : Statut, durée, erreurs éventuelles
- 🔍 **Debug visual** : Interface claire pour identifier les problèmes

## ⚙️ Configuration des sons

```typescript
const SOUND_CONFIG = {
  night: { 
    sound: 'night-atmosphere-with-crickets-374652', 
    volume: 0.6, 
    folder: 'nuit-profonde',
    fadeInDuration: 3000,  // 3s d'entrée douce
    fadeOutDuration: 4000  // 4s de sortie progressive
  },
  // ... autres configurations
};
```

### 🎚️ Durées de fondu par période

| Période | Fade In | Fade Out | Raison |
|---------|---------|----------|---------|
| **Nuit** | 3000ms | 4000ms | Transitions très douces pour le sommeil |
| **Aube** | 2000ms | 2500ms | Réveil progressif |
| **Lever de soleil** | 1500ms | 2000ms | Transition dynamique |
| **Matin** | 1500ms | 2000ms | Énergie matinale |
| **Midi** | 2000ms | 2500ms | Ambiance subtile |
| **Après-midi** | 2000ms | 2500ms | Continuité apaisante |
| **Coucher de soleil** | 2500ms | 3000ms | Transition vers le soir |
| **Crépuscule** | 2500ms | 3000ms | Préparation au repos |

## 🔧 Fonctionnalités avancées

### Cross-fade intelligent
```typescript
// Transition fluide avec easing cubic
const easedProgress = 1 - Math.pow(1 - progress, 3);
oldAudio.volume = initialOldVolume * (1 - easedProgress);
newAudio.volume = targetVolume * easedProgress;
```

### Gestion des fichiers courts
- ✅ **Loop automatique** : `audio.loop = true`
- ⚡ **Préchargement** : `audio.preload = 'auto'`
- 🔄 **Reset mémoire** : `audio.currentTime = 0`

### Système de fallback
```typescript
if (newSoundType !== 'birds-singing') {
  console.log('🔄 Tentative de fallback vers birds-singing...');
  setTimeout(() => {
    crossFadeToNewSound('birds-singing', targetVolume);
  }, 1000);
}
```

## 📱 Interface utilisateur

### Panneau de contrôle réduit
- 🎵 **Bouton flottant** avec emoji musical
- 💡 **Tooltip informatif** avec instructions
- ✨ **Indicateur clignotant** pour attirer l'attention

### Panneau de contrôle étendu
- 🎛️ **Slider de volume** avec style personnalisé
- 📊 **Barre visuelle** du niveau sonore
- ℹ️ **Informations détaillées** sur les fonctionnalités
- 🔧 **Accès au diagnostic** en un clic

## 🚀 Utilisation

### Intégration basique
```tsx
<AmbientSoundManager 
  skyMode={currentSkyMode} 
  enabled={audioEnabled} 
  volume={audioVolume} 
/>
```

### Avec contrôles
```tsx
<AudioControlPanel
  onVolumeChange={setAudioVolume}
  onToggleEnabled={setAudioEnabled}
  enabled={audioEnabled}
  volume={audioVolume}
/>
```

## 🔍 Diagnostic et débogage

### Tests automatiques
- 📋 **13 fichiers audio** testés automatiquement
- ⏱️ **Timeout 10s** par fichier
- 📊 **Rapport complet** avec durées et erreurs

### Indicateurs visuels
- ⏳ **Chargement** : spinner jaune
- ♪ **Lecture** : note verte clignotante  
- 🔄 **Transition** : icône bleue de rotation
- ❌ **Erreur** : affichage des détails

## 💡 Bonnes pratiques

### Pour les fichiers audio
- 📏 **Durée optimale** : 30s à 2min pour les boucles
- 🔊 **Volume normalisé** : -12dB à -6dB
- 📦 **Format MP3** : Compression appropriée (128-192kbps)
- 🔁 **Point de boucle** : Début et fin identiques

### Pour les développeurs
- 🧪 **Tests réguliers** : Utiliser le diagnostic intégré
- 📊 **Monitoring console** : Vérifier les logs détaillés
- 🔧 **Gestion erreurs** : Prévoir les fallbacks
- 💾 **Optimisation mémoire** : Reset des références audio

## 🐛 Dépannage

### Problèmes courants
1. **Son ne se charge pas** : Vérifier l'existence du fichier
2. **Coupures audio** : Utiliser `preload='auto'`
3. **Transitions brutales** : Ajuster les durées de fondu
4. **Mémoire élevée** : S'assurer du reset des audio objects

### Logs utiles
```
🎵 Cross-fade vers blackbird terminé (boucle: true)
🔇 Son stoppé avec fade out de 2000ms
⚠️ Erreur lors du cross-fade vers forest_cicada: NetworkError
🔄 Tentative de fallback vers birds-singing...
```
