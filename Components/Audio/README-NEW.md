# 🎵 Système Audio Dynamique - Guide d'utilisation

## 📋 Vue d'ensemble

Le système audio de TimeTracker V4 a été complètement réorganisé pour utiliser les fichiers sonores réels présents dans `public/sounds/`. Il offre maintenant :

- ✅ **Fondus d'entrée/sortie intelligents** : Plus d'arrêts brutaux
- ✅ **Boucles seamless** : Lecture continue sans coupure
- ✅ **Durées configurables** : Chaque période a ses propres timings
- ✅ **Synchronisation parfaite** : Audio connecté au mode visuel
- ✅ **Panel de test intégré** : Testez tous les modes facilement

## 🗂️ Structure des fichiers audio

```
public/sounds/
├── aube/                           # 🌅 Sons d'aube
│   └── village_morning_birds_roosters.mp3
├── lever-soleil/                   # 🌄 Sons lever de soleil
│   └── blackbird.mp3 (court → boucle)
├── matin/                          # 🌞 Sons matinaux
│   ├── insect_bee_fly.mp3
│   └── morning-birdsong.mp3
├── midi/                           # ☀️ Sons de midi
│   └── forest_cicada.mp3 (court → boucle)
├── apres-midi/                     # 🌤️ Sons après-midi
│   ├── birds-singing.mp3
│   └── summer-insects-243572.mp3
├── coucher-soleil/                 # 🌇 Sons coucher
│   ├── bird-chirp.mp3
│   └── grillon-drome.mp3 (court → boucle)
├── crepuscule/                     # 🌆 Sons crépusculaires
│   ├── cricket-single.mp3 (court → boucle)
│   └── merle-blackbird.mp3
└── nuit-profonde/                  # 🌙 Sons nocturnes
    ├── hibou-molkom.mp3
    └── night-atmosphere-with-crickets-374652.mp3
```

## ⚙️ Configuration des fondus

Chaque période a ses propres durées de transition optimisées :

| Période | Fichier | Fondu IN | Fondu OUT | Boucle |
|---------|---------|----------|-----------|---------|
| 🌙 Nuit | `night-atmosphere-with-crickets-374652.mp3` | 3.0s | 4.0s | ✅ |
| 🌆 Crépuscule | `cricket-single.mp3` | 2.5s | 3.0s | ✅ (court) |
| 🌅 Aube | `village_morning_birds_roosters.mp3` | 2.0s | 2.5s | ✅ |
| 🌄 Lever soleil | `blackbird.mp3` | 1.5s | 2.0s | ✅ (court) |
| 🌞 Matin | `morning-birdsong.mp3` | 1.5s | 2.0s | ✅ |
| ☀️ Midi | `forest_cicada.mp3` | 2.0s | 2.5s | ✅ (court) |
| 🌤️ Après-midi | `summer-insects-243572.mp3` | 2.0s | 2.5s | ✅ |
| 🌇 Coucher soleil | `grillon-drome.mp3` | 2.5s | 3.0s | ✅ (court) |

## 🎮 Utilisation du panneau de contrôle

### Accès au panneau
1. Cliquez sur le bouton **🎵** en bas à droite
2. Le panneau de contrôle s'ouvre avec toutes les options

### Fonctionnalités disponibles
- **Activer/Désactiver** : Bouton principal pour l'audio
- **Contrôle du volume** : Slider de 0% à 100%
- **Tests des modes** : Cliquez sur "🔽 Tester les modes audio" pour voir tous les boutons de test

### Tester les différents modes
Dans le panneau de test, vous pouvez cliquer sur :
- 🌅 **Aube** : Chants matinaux de coq et oiseaux
- 🌄 **Lever soleil** : Merle solitaire (boucle)
- 🌞 **Matin** : Abeilles et chants d'oiseaux variés
- ☀️ **Midi** : Cigales de forêt (boucle)
- 🌤️ **Après-midi** : Oiseaux et insectes d'été
- 🌇 **Coucher soleil** : Grillons du soir (boucle)
- 🌆 **Crépuscule** : Grillons isolés (boucle)
- 🌙 **Nuit** : Chouettes et grillons nocturnes

## 🔧 Fonctionnalités techniques

### Fondus intelligents
- **Cross-fade** : Transition douce entre deux sons différents
- **Fade-in/out** : Entrée et sortie progressives sans coupure
- **Volume smoothing** : Ajustements de volume ultra-fluides

### Gestion des boucles
- **Auto-loop** : Tous les fichiers sont automatiquement en boucle
- **Seamless** : Pas de coupure audible entre les répétitions
- **Optimisé pour fichiers courts** : Les sons de < 30s sont spécialement gérés

### Synchronisation
- **Mode visuel** : L'audio suit automatiquement le mode de fond
- **Temps réel** : Changements instantanés lors des transitions visuelles
- **État persistant** : Volume et activation se souviennent entre sessions

## 🐛 Diagnostic et dépannage

### Console de développement
Surveillez les messages console pour :
- `🎵 Cross-fade vers [mode] terminé` : Transition réussie
- `⚠️ Erreur lors du cross-fade` : Problème de chargement
- `🎨 Changement de mode vers: [mode]` : Synchronisation mode visuel

### Vérification des fichiers
Si un son ne fonctionne pas :
1. Vérifiez que le fichier existe dans le bon dossier
2. Confirmez que l'extension est `.mp3`
3. Testez la lecture directe du fichier dans le navigateur

### Performances
Le système est optimisé pour :
- **Chargement rapide** : Préchargement des fichiers courts
- **Mémoire efficace** : Un seul fichier audio en mémoire à la fois
- **Transitions fluides** : Utilisation de `requestAnimationFrame`

## 📱 Compatibilité

- ✅ **Chrome/Edge** : Support complet
- ✅ **Firefox** : Support complet  
- ✅ **Safari** : Support complet (autoplay selon politique)
- ✅ **Mobile** : Fonctionne après première interaction utilisateur

## 🎯 Améliorations futures possibles

- 🔮 **Mélange de sons** : Superposition de plusieurs ambiances
- 🔮 **Égaliseur** : Contrôles graves/aigus
- 🔮 **Présets personnalisés** : Combinaisons utilisateur
- 🔮 **Analyse spectrale** : Visualisation en temps réel

---

**Version** : 2.0 (22 juillet 2025)  
**Compatibilité** : TimeTracker V4+  
**Statut** : ✅ Production Ready
