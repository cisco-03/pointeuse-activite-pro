// 🎮 CONTRÔLEUR MANUEL POUR DYNAMIC BAC// 🎮 CONTRÔLEUR MANUEL POUR DYNAMIC BACKGROUND
// Utilisez ce fichier pour tester les différents modes

// Liste des modes disponibles
const AVAILABLE_MODES = [
  'dawn',      // Aube
  'sunrise',   // Lever du soleil
  'morning',   // Matin
  'midday',    // Midi
  'afternoon', // Après-midi
  'sunset',    // Coucher du soleil
  'dusk',      // Crépuscule
  'night'      // Nuit
];

// 🔧 FONCTION PRINCIPALE: Changer le mode
export const setMode = (mode: string) => {
  if (AVAILABLE_MODES.includes(mode)) {
    console.log(`🎨 Passage en mode: ${mode}`);
    // Utiliser la fonction globale exposée par DynamicBackground
    if ((window as any).setBackgroundMode) {
      (window as any).setBackgroundMode(mode);
    } else {
      console.warn('⚠️ Fonction setBackgroundMode non trouvée. Assurez-vous que DynamicBackground est chargé.');
    }
  } else {
    console.error(`❌ Mode invalide: ${mode}. Modes disponibles:`, AVAILABLE_MODES);
  }
};

// 🔧 FONCTIONS RACCOURCIES pour chaque mode
export const dawn = () => setMode('dawn');
export const sunrise = () => setMode('sunrise');
export const morning = () => setMode('morning');
export const midday = () => setMode('midday');
export const afternoon = () => setMode('afternoon');
export const sunset = () => setMode('sunset');
export const dusk = () => setMode('dusk');
export const night = () => setMode('night');

// 🌟 FONCTION SPÉCIALE: Test des nouvelles micro-étoiles
export const testMicroStars = () => {
  console.log('🌌 Test des nouvelles micro-étoiles en nuit profonde...');
  setMode('night');

  // Attendre un peu puis compter les étoiles
  setTimeout(() => {
    const fixedStars = document.querySelectorAll('.fixed-star');
    const ultraMicro = document.querySelectorAll('.fixed-star-ultra-micro');
    const micro = document.querySelectorAll('.fixed-star-micro');
    const small = document.querySelectorAll('.fixed-star-small');
    const medium = document.querySelectorAll('.fixed-star-medium');
    const large = document.querySelectorAll('.fixed-star-large');

    console.log('✨ ÉTOILES DÉTECTÉES:');
    console.log(`   🔍 Total étoiles fixes: ${fixedStars.length}`);
    console.log(`   ⭐ Ultra-micro: ${ultraMicro.length} (attendu: 600)`);
    console.log(`   ⭐ Micro: ${micro.length} (attendu: 320)`);
    console.log(`   ⭐ Small: ${small.length} (attendu: 90)`);
    console.log(`   ⭐ Medium: ${medium.length} (attendu: 30)`);
    console.log(`   ⭐ Large: ${large.length} (attendu: 10)`);

    if (fixedStars.length === 0) {
      console.warn('❌ Aucune étoile détectée ! Problème de génération ou de z-index.');
    } else if (ultraMicro.length === 0) {
      console.warn('❌ Aucune ultra-micro étoile ! Vérifiez la configuration nuit.');
    } else {
      console.log('✅ Étoiles générées avec succès !');
    }

    console.log('🔄 Comparez avec: dawn() puis revenez avec night()');
  }, 1000);
};

// 🔧 FONCTION CYCLE: Parcourir tous les modes automatiquement
export const cycleAllModes = (delaySeconds: number = 3) => {
  let currentIndex = 0;
  
  const cycleNext = () => {
    setMode(AVAILABLE_MODES[currentIndex]);
    currentIndex = (currentIndex + 1) % AVAILABLE_MODES.length;
    
    if (currentIndex === 0) {
      console.log('🔄 Cycle terminé ! Recommencer avec cycleAllModes() si désiré.');
      return;
    }
    
    setTimeout(cycleNext, delaySeconds * 1000);
  };
  
  console.log(`🔄 Début du cycle automatique (${delaySeconds}s entre chaque mode)...`);
  cycleNext();
};

// 🔧 NOUVELLE FONCTION: Synchroniser avec l'heure réelle du PC
export const syncWithRealTime = () => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  
  console.log(`🕒 Heure actuelle: ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  
  let targetMode: string;
  
  // Déterminer le mode selon l'heure
  if (hour >= 5 && hour < 6) {
    targetMode = 'dawn'; // 5h-6h : Aube
  } else if (hour >= 6 && hour < 8) {
    targetMode = 'sunrise'; // 6h-8h : Lever du soleil
  } else if (hour >= 8 && hour < 11) {
    targetMode = 'morning'; // 8h-11h : Matin
  } else if (hour >= 11 && hour < 15) {
    targetMode = 'midday'; // 11h-15h : Midi
  } else if (hour >= 15 && hour < 18) {
    targetMode = 'afternoon'; // 15h-18h : Après-midi
  } else if (hour >= 18 && hour < 20) {
    targetMode = 'sunset'; // 18h-20h : Coucher du soleil
  } else if (hour >= 20 && hour < 22) {
    targetMode = 'dusk'; // 20h-22h : Crépuscule
  } else {
    targetMode = 'night'; // 22h-5h : Nuit
  }
  
  console.log(`🎨 Synchronisation avec l'heure réelle: ${targetMode}`);
  setMode(targetMode);
  
  return targetMode;
};

// 🔧 AIDE: Afficher les commandes disponibles
export const help = () => {
  console.log(`
🎮 CONTRÔLEUR MANUEL DYNAMIC BACKGROUND

Commandes disponibles:
📍 setMode('nom_du_mode') - Changer vers un mode spécifique
📍 dawn() - Mode aube (5h-6h)
📍 sunrise() - Mode lever du soleil (6h-8h)
📍 morning() - Mode matin (8h-11h)
📍 midday() - Mode midi (11h-15h)
📍 afternoon() - Mode après-midi (15h-18h)
📍 sunset() - Mode coucher du soleil (18h-20h)
📍 dusk() - Mode crépuscule (20h-22h)
📍 night() - Mode nuit (22h-5h)

🔄 cycleAllModes(delai) - Cycle automatique (délai en secondes)
🕒 syncWithRealTime() - Synchroniser avec l'heure du PC
❓ help() - Afficher cette aide

Exemples:
  dawn()              // Passer en mode aube
  setMode('sunset')   // Passer en mode coucher du soleil
  syncWithRealTime()  // Synchroniser avec l'heure actuelle
  cycleAllModes(5)    // Cycle avec 5s entre chaque mode
`);
};

// Exposer les fonctions globalement pour utilisation dans la console
if (typeof window !== 'undefined') {
  (window as any).bgControl = {
    setMode,
    dawn,
    sunrise,
    morning,
    midday,
    afternoon,
    sunset,
    dusk,
    night,
    cycleAllModes,
    syncWithRealTime,
    help
  };
  
  console.log(`
🎮 CONTRÔLEUR MANUEL ACTIVÉ !

Pour contrôler l'arrière-plan, utilisez:
  bgControl.dawn()            // Mode aube
  bgControl.night()           // Mode nuit
  bgControl.syncWithRealTime() // Sync avec l'heure PC
  bgControl.help()            // Voir toutes les commandes
  bgControl.cycleAllModes()   // Cycle automatique

Ou directement:
  setMode('dawn')
  syncWithRealTime()
  `);
}

export default {
  setMode,
  dawn,
  sunrise,
  morning,
  midday,
  afternoon,
  sunset,
  dusk,
  night,
  cycleAllModes,
  syncWithRealTime,
  help
};
