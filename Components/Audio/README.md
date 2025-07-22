# 🎵 Système d'Ambiance Sonore

Ce système ajoute des sons d'ambiance automatiques qui s'adaptent au cycle jour/nuit de votre arrière-plan dynamique.

## 📁 Structure des fichiers

```
public/sounds/
├── crickets.mp3    # Grillons pour la nuit
├── birds.mp3       # Chants d'oiseaux pour l'aube/matin
├── wind.mp3        # Vent léger pour l'après-midi/soir
├── rain.mp3        # Pluie (optionnel)
├── waves.mp3       # Vagues (optionnel)
├── forest.mp3      # Forêt (optionnel)
└── night.mp3       # Ambiance nocturne (optionnel)
```

## 🎼 Sons recommandés par période

| Période | Son principal | Volume | Description |
|---------|---------------|--------|-------------|
| **Nuit** (22h-6h) | `crickets.mp3` | 60% | Grillons, bruits nocturnes doux |
| **Aube/Matin** (6h-12h) | `birds.mp3` | 50-70% | Chants d'oiseaux, réveil de la nature |
| **Midi** (12h-15h) | Silence | 0% | Pas de son pour se concentrer |
| **Après-midi** (15h-18h) | `wind.mp3` | 30% | Vent léger, bruissement |
| **Crépuscule** (18h-22h) | `crickets.mp3` | 40% | Transition vers la nuit |

## 🔧 Intégration dans votre application

### 1. Ajouter le gestionnaire de sons

```tsx
import AmbientSoundManager from './Components/Audio/AmbientSoundManager';
import AudioControlPanel from './Components/Audio/AudioControlPanel';

function App() {
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);

  return (
    <div>
      {/* Votre contenu existant */}
      
      {/* Gestionnaire de sons d'ambiance */}
      <AmbientSoundManager 
        skyMode={currentSkyMode} // 'night', 'dawn', 'morning', etc.
        enabled={audioEnabled}
        volume={audioVolume}
      />
      
      {/* Panneau de contrôle audio */}
      <AudioControlPanel
        enabled={audioEnabled}
        volume={audioVolume}
        onToggleEnabled={setAudioEnabled}
        onVolumeChange={setAudioVolume}
      />
    </div>
  );
}
```

### 2. Connecter avec DynamicBackground

```tsx
// Dans DynamicBackground.tsx, passer le mode actuel
<AmbientSoundManager skyMode={currentMode} enabled={audioEnabled} volume={audioVolume} />
```

## 📥 Où trouver des sons libres de droits

### Sources recommandées :
- **Freesound.org** - Sons d'ambiance gratuits
- **Zapsplat** - Bibliothèque complète (compte gratuit)
- **BBC Sound Effects** - Sons de la BBC gratuits
- **Adobe Audition** - Sons inclus si vous avez la licence

### Conseils pour les fichiers audio :
- **Format :** MP3 (meilleure compatibilité)
- **Qualité :** 128 kbps suffisant pour l'ambiance
- **Durée :** 2-5 minutes minimum pour éviter les répétitions
- **Volume :** Normalisé, pas trop fort
- **Boucle :** Sons qui se bouclent naturellement

## 🎚️ Paramètres avancés

### Personnaliser les sons par mode :

```tsx
// Dans AmbientSoundManager.tsx
const SOUND_CONFIG: Record<string, { sound: AmbientSoundType; volume: number }> = {
  night: { sound: 'crickets', volume: 0.6 },
  dawn: { sound: 'birds', volume: 0.5 },
  morning: { sound: 'birds', volume: 0.7 },
  midday: { sound: 'none', volume: 0 },
  afternoon: { sound: 'wind', volume: 0.3 },
  sunset: { sound: 'wind', volume: 0.4 },
  dusk: { sound: 'crickets', volume: 0.4 }
};
```

### Ajouter de nouveaux types de sons :

```tsx
type AmbientSoundType = 
  | 'crickets'
  | 'birds'
  | 'wind'
  | 'rain'        // Nouveau
  | 'thunder'     // Nouveau
  | 'cafe'        // Nouveau
  | 'fireplace'   // Nouveau
  | 'none';
```

## 🐛 Résolution des problèmes

### Le son ne se lance pas
1. Vérifiez que les fichiers sont dans `public/sounds/`
2. Testez l'autoplay dans votre navigateur (Chrome bloque l'autoplay)
3. Vérifiez la console pour les erreurs de chargement

### Problèmes de performance
1. Utilisez des fichiers MP3 compressés
2. Limitez la durée des fichiers
3. Désactivez les sons sur mobile si nécessaire

### Transitions brusques
1. Ajustez les durées de fade in/out
2. Vérifiez que les sons se bouclent bien
3. Normalisez le volume de vos fichiers audio

## 🎯 Exemples de noms de fichiers

```
crickets.mp3          # Grillons de nuit
birds-dawn.mp3        # Oiseaux du matin
wind-light.mp3        # Vent léger
rain-gentle.mp3       # Pluie douce
forest-ambiance.mp3   # Ambiance forêt
night-silence.mp3     # Silence nocturne avec textures
```

---

💡 **Conseil :** Commencez avec 3-4 sons de base (grillons, oiseaux, vent) et ajoutez progressivement selon vos besoins.
