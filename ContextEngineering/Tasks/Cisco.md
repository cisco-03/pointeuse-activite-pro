
**Consulte ce fichier aussi souvent que possible lorsque tu commences une tâche, pendant la tâche et à la fin de la tâche, tu dois toujours vérifier ce fichier. Entre temps, je peux te donner des infos et des instructions supplémentaires N'écris rien dans ce fichier. Ce fichier m'appartient. C'est simplement un fichier pour dialoguer avec toi pour des tâches supplémentaires, en te décrivant les étapes avec précision.**


**Panneau de contrôle arrière-plan pour simuler les modes de transition entre la nuit profonde jusqu'au crépuscule**
Nous allons régler correctement les phases de transition au clic événement sur chaque bouton `NuitProfonde`, `Aube`, `LeverDeSoleil`, `Matin`, `Midi`, `Zénith`, `AprèsMidi`, `CoucherDeSoleil`, `Crépuscule`. 
Components\UI\TimeSimulator.tsx


**Ci-dessous, le fichier qui contrôle la dérive du soleil au clic événement sur chaque bouton du contrôle arrière-plan**
Components\Background\SunriseAnimation.tsx


**ci-dessous les répertoires où sont stockés les sons, effects pour les boutons au clic événement**
public\sounds
public\sounds\apres-midi
public\sounds\aube
public\sounds\coucher-soleil
public\sounds\crepuscule
public\sounds\lever-soleil
public\sounds\matin
public\sounds\midi
public\sounds\nuit-profonde

**Ici dessous, les répertoires avec les fichiers respectifs qui contrôlent l'audio.**
Components\Audio
Components\Audio\AmbientSoundManager.tsx
Components\Audio\AudioControlPanel.tsx



**Instructions supplémentaires de la part de Cisco pendant la réalisation des tâches**

Je rédigerai des notes supplémentaires pendant vos tâches. Donc surveillez bien ce fichier 


## POSITIONS DU SOLEIL - SPÉCIFICATIONS COMPLÈTES

**SYNCHRONISATION CRITIQUE :** Le soleil doit avoir la même durée de transition que l'arrière-plan (15s standard, 20s pour matin, 26s pour matin spécifique).

### 🌌 NUIT PROFONDE (2h00)
Position Y finale souhaitée : -25% (très bas sous l'horizon)
Position X finale souhaitée : -80%
Lens-flare souhaité : 0.0 (aucun)
Durée transition : 15 secondes
Note : Soleil au plus bas, aucune lueur visible

### 🌅 AUBE (6h00)
Position Y finale souhaitée : -15% (sous l'horizon)
Position X finale souhaitée : -60% (position Est)
Lens-flare souhaité : 0.0 (aucun)
Durée transition : 15 secondes
Note : Soleil encore sous l'horizon, première lueur à l'Est

### 🌄 LEVER DE SOLEIL (7h00)
Position Y finale souhaitée : 25% (au-dessus horizon)
Position X finale souhaitée : -30% (légèrement Est)
Lens-flare souhaité : 1.0 (intense)
Durée transition : 15 secondes
Note : Soleil émerge à l'horizon, rayons intenses

### 🌞 MATIN (9h00)
Position Y finale souhaitée : -115% (spécifications exactes Cisco)
Position X finale souhaitée : -40% (spécifications exactes Cisco)
Lens-flare souhaité : 0.05 (spécifications exactes Cisco)
Durée transition : 26 secondes (spécial pour distance Y=-115%)
Note : Vérification anti-accélération - synchronisation parfaite avec arrière-plan

### ☀️ MIDI/ZÉNITH (12h00)
Position Y finale souhaitée : -215% (spécifications exactes Cisco)
Position X finale souhaitée : -140% (spécifications exactes Cisco)
Lens-flare souhaité : 0.01 (spécifications exactes Cisco)
Durée transition : 15 secondes
Note : Point culminant, lens-flare réduit automatiquement selon altitude

### 🌇 APRÈS-MIDI (15h00)
Position Y finale souhaitée : -115% (même hauteur que matin - symétrie parfaite)
Position X finale souhaitée : -40% (même position que matin - symétrie parfaite)
Lens-flare souhaité : 0.05 (spécifications exactes Cisco)
Durée transition : 26 secondes (même durée que matin pour cohérence)
Note : Symétrie parfaite avec matin 9h - même position, trajectoire symétrique

### 🌆 COUCHER DE SOLEIL (18h00)
Position Y finale souhaitée : 25% (même hauteur que lever)
Position X finale souhaitée : 45% (position Ouest, symétrique)
Lens-flare souhaité : 1.0 (intense comme lever)
Durée transition : 22 secondes (descente progressive et naturelle)
Note : Symétrie parfaite avec lever de soleil, descente plus lente pour réalisme

### 🌃 CRÉPUSCULE (19h00)
Position Y finale souhaitée : -20% (sous l'horizon)
Position X finale souhaitée : 60% (position Ouest)
Lens-flare souhaité : 0.0 (aucun)
Durée transition : 15 secondes
Note : Soleil disparu sous l'horizon à l'Ouest, dernière lueur

## RÈGLES DE SYNCHRONISATION OBLIGATOIRES

### ⏱️ DURÉES DE TRANSITION
- **Standard** : 15 secondes (dawn, sunrise, midday, afternoon, sunset, dusk, night)
- **Matin spécial** : 20 secondes (mode matin arrière-plan)
- **Matin soleil** : 26 secondes (animation soleil Y=-115% uniquement)

### 🎯 SYNCHRONISATION PARFAITE
1. **Arrière-plan et soleil** doivent avoir la MÊME durée de transition
2. **Aucune accélération** visible en fin de course
3. **Easing identique** : "power2.inOut" pour mouvement naturel
4. **Déclenchement simultané** : arrière-plan + soleil + audio

### 📐 SYSTÈME DE COORDONNÉES
- **Ligne d'horizon** = 0° (milieu écran)
- **Valeurs négatives** = sous l'horizon
- **Valeurs positives** = au-dessus horizon
- **Position X** : négative = Est, positive = Ouest

### 🌟 LENS FLARE ADAPTATIF
- **Altitude élevée** = lens-flare réduit (zénith = 0.01)
- **Horizon** = lens-flare intense (lever/coucher = 1.0)
- **Sous horizon** = aucun lens-flare (0.0)
- **Dimension automatique** selon position Y

### 🔧 FICHIERS CONCERNÉS
- `Components\Background\SunriseAnimation.tsx` : Positions et animations soleil
- `Components\Background\DynamicBackground.tsx` : Durées transitions arrière-plan
- `Components\UI\TimeSimulator.tsx` : Déclenchement modes et synchronisation
















































