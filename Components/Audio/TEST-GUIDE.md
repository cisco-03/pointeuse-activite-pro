# 🧪 Guide de Test - Système Audio TimeTracker V4

## 🎯 Tests à effectuer

### 1. Test du panneau de contrôle audio
1. **Ouvrir l'application** dans votre navigateur
2. **Localiser le bouton 🎵** en bas à droite (avec animation pulsante)
3. **Cliquer sur le bouton** pour ouvrir le panneau de contrôle
4. **Vérifier les éléments** :
   - Bouton Activé/Désactivé
   - Slider de volume (0-100%)
   - Section "🔽 Tester les modes audio"

### 2. Test des fondus d'entrée/sortie
1. **Activer l'audio** avec le bouton principal
2. **Ajuster le volume** à ~50% avec le slider
3. **Cliquer sur "🔽 Tester les modes audio"**
4. **Tester chaque mode** en cliquant sur les boutons :
   - 🌅 Aube → `village_morning_birds_roosters.mp3`
   - 🌄 Lever soleil → `blackbird.mp3` (court, boucle)
   - 🌞 Matin → `morning-birdsong.mp3`
   - ☀️ Midi → `forest_cicada.mp3` (court, boucle)
   - 🌤️ Après-midi → `summer-insects-243572.mp3`
   - 🌇 Coucher soleil → `grillon-drome.mp3` (court, boucle)
   - 🌆 Crépuscule → `cricket-single.mp3` (court, boucle)
   - 🌙 Nuit → `night-atmosphere-with-crickets-374652.mp3`

### 3. Validation des transitions
Pour chaque changement de mode, vérifiez :
- ✅ **Fondu d'entrée** : Le nouveau son apparaît progressivement
- ✅ **Pas de coupure brutale** : Transition douce sans silence
- ✅ **Cross-fade** : Si un son joue déjà, transition croisée
- ✅ **Boucle seamless** : Pas de coupure quand le fichier reboucle

### 4. Test des durées de fondu
| Mode | Durée attendue | Observation |
|------|----------------|-------------|
| 🌙 Nuit | 3-4s | Fondu très lent et doux |
| 🌆 Crépuscule | 2.5-3s | Transition modérée |
| 🌅 Aube | 2-2.5s | Transition naturelle |
| 🌄 Lever soleil | 1.5-2s | Transition rapide |
| 🌞 Matin | 1.5-2s | Transition énergique |
| ☀️ Midi | 2-2.5s | Transition équilibrée |
| 🌤️ Après-midi | 2-2.5s | Transition stable |
| 🌇 Coucher soleil | 2.5-3s | Transition apaisante |

### 5. Test de synchronisation visuelle
1. **Utiliser les contrôles de simulation de temps** (si disponibles)
2. **Observer** que l'audio suit automatiquement le mode visuel
3. **Vérifier** que les changements d'heure déclenchent les bonnes ambiances

### 6. Test des indicateurs visuels
Dans le panneau de contrôle, observer :
- **🎵** : Icône de base
- **♪** : Animation quand un son joue (vert clignotant)
- **⏳** : Indicateur de chargement (jaune tournant)
- **🔄** : Indicateur de transition (bleu)

### 7. Test de la console développeur
1. **Ouvrir la console** (F12 → Console)
2. **Changer de modes** et surveiller les messages :
   ```
   🎵 Cross-fade vers blackbird terminé
   🎨 Changement de mode vers: sunrise
   ```
3. **Tester la fonction globale** :
   ```javascript
   window.setBackgroundMode('night')
   ```

### 8. Test du contrôle de volume
1. **Déplacer le slider** de volume
2. **Vérifier** que le volume change en temps réel
3. **Observer** la barre de progression violette sous les indicateurs

### 9. Test de désactivation
1. **Cliquer sur "Désactivé"** dans le panneau
2. **Vérifier** que tous les sons s'arrêtent avec un fondu de sortie
3. **Réactiver** et vérifier que le dernier mode reprend

### 10. Test de performance
- **Utilisation CPU** : Doit rester < 5% en lecture
- **Utilisation mémoire** : Augmentation modérée (~10-20MB)
- **Fluidité interface** : Pas de lag pendant les transitions
- **Réactivité** : Changements immédiats au clic

## 🔍 Points d'attention

### ✅ Comportements attendus
- Transitions fluides sans coupure
- Boucles imperceptibles sur fichiers courts
- Volume cohérent entre différents fichiers
- Interface réactive et intuitive
- Synchronisation parfaite visuel/audio

### ⚠️ Problèmes potentiels
- **Erreur 404** : Fichier audio manquant
- **Pas de son** : Politique autoplay du navigateur
- **Coupures** : Problèmes de réseau/chargement
- **Décalage** : Performance insuffisante

### 🛠️ Solutions de dépannage
1. **Actualiser la page** si premier chargement
2. **Vérifier le volume système** et navigateur
3. **Tester sur Chrome** pour compatibilité maximale
4. **Consulter la console** pour erreurs détaillées

## 📊 Critères de validation

### Audio ✅
- [ ] Tous les 8 modes audio fonctionnent
- [ ] Fondus d'entrée/sortie fluides
- [ ] Boucles seamless sans coupure
- [ ] Volume ajustable en temps réel
- [ ] Arrêt propre sans coupure brutale

### Interface ✅
- [ ] Bouton 🎵 visible et réactif
- [ ] Panneau s'ouvre/ferme correctement
- [ ] Tous les boutons de test fonctionnent
- [ ] Indicateurs visuels cohérents
- [ ] Tooltip informatif visible

### Performance ✅
- [ ] Transitions < 4 secondes
- [ ] Pas de lag interface
- [ ] Consommation mémoire raisonnable
- [ ] Aucune erreur console

---

**Temps de test estimé** : 10-15 minutes  
**Prérequis** : Navigateur moderne avec audio activé  
**Support** : Chrome 90+, Firefox 88+, Safari 14+
