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

// 🔧 CISCO: SUPPRESSION - Plus de cycle automatique
// export const cycleAllModes = ... // SUPPRIMÉ - Mode manuel uniquement

// 🔧 CISCO: SUPPRESSION - Plus de synchronisation automatique avec l'heure PC
// export const syncWithRealTime = ... // SUPPRIMÉ - Mode manuel uniquement

// 🔧 CISCO: AIDE SIMPLIFIÉE - Mode manuel uniquement
export const help = () => {
  console.log(`
🎮 CONTRÔLEUR MANUEL DYNAMIC BACKGROUND - MODE SIMPLIFIÉ

Commandes disponibles:
📍 setMode('nom_du_mode') - Changer vers un mode spécifique
📍 dawn() - Mode aube
📍 sunrise() - Mode lever du soleil
📍 morning() - Mode matin
📍 midday() - Mode midi (par défaut)
📍 afternoon() - Mode après-midi
📍 sunset() - Mode coucher du soleil
📍 dusk() - Mode crépuscule
📍 night() - Mode nuit

❓ help() - Afficher cette aide

Exemples:
  dawn()              // Passer en mode aube
  setMode('sunset')   // Passer en mode coucher du soleil
  midday()            // Retour au mode par défaut (12h)
`);
};

// 🔧 CISCO: Exposition simplifiée - Mode manuel uniquement
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
    help
  };

  console.log(`
🎮 CONTRÔLEUR MANUEL SIMPLIFIÉ !

Pour contrôler l'arrière-plan via console:
  bgControl.dawn()      // Mode aube
  bgControl.midday()    // Mode par défaut (12h)
  bgControl.night()     // Mode nuit
  bgControl.help()      // Voir toutes les commandes

Ou directement:
  setMode('dawn')
  midday()              // Retour au mode par défaut
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
  help
};
