# 🎵 Dossier Audio - Effets Sonores d'Ambiance

Ce dossier contient les fichiers audio pour le système d'ambiance sonore automatique.

## 📁 Structure des fichiers

- `crickets.mp3` - Sons de grillons pour la nuit
- `birds.mp3` - Chants d'oiseaux pour l'aube/matin
- `wind.mp3` - Sons de vent léger pour l'après-midi
- `night-ambiance.mp3` - Ambiance nocturne générale
- `nature.mp3` - Sons de la nature généralistes

## 🎚️ Caractéristiques techniques

- **Format recommandé :** MP3, 128kbps minimum
- **Durée :** 30 secondes à 2 minutes (en boucle)
- **Volume :** Normalisé, pas trop fort
- **Qualité :** Bonne qualité mais pas trop lourds pour le web

## 🔄 Système de fondu

Le système applique automatiquement :
- **Fade-in** : 2 secondes au démarrage
- **Cross-fade** : 3 secondes entre les transitions
- **Fade-out** : 2 secondes à l'arrêt
- **Volume adaptatif** : Selon l'heure de la journée

## 📝 Notes d'utilisation

1. Les fichiers sont chargés dynamiquement selon le mode de ciel
2. La transition entre sons est ultra-fluide avec cross-fade
3. Le volume s'adapte automatiquement au contexte
4. Tous les sons sont en boucle continue

## 🎯 Modes automatiques

- **Nuit (20h-5h)** → crickets.mp3
- **Aube/Matin (5h-10h)** → birds.mp3  
- **Midi (11h-14h)** → Silence
- **Après-midi/Soir (15h-19h)** → wind.mp3

---
*🔧 Système développé pour TimeTracker v4 avec transitions fluides*
