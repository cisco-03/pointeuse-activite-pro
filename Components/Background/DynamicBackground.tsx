import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import AstronomicalLayer from './AstronomicalLayer';
import DiurnalLayer from './DiurnalLayer';
import SunriseAnimation, { SunriseAnimationRef } from './SunriseAnimation';
import { useLocation } from '../Context/LocationContext';
import { useTime } from '../Context/TimeContext';
import * as SunCalc from 'suncalc';
import './BackgroundController'; // 🔧 IMPORT: Contrôleur manuel

// 🔧 CISCO: Système de rotation supprimé - Background fixe pour éviter les changements automatiques

// 🔧 CISCO: Fonction supprimée - Background fixe pour éviter les changements automatiques

// 🔧 SYSTÈME DE PILOTAGE MANUEL SIMPLIFIÉ
// Types pour les modes de fond prédéfinis
type BackgroundMode = 
  | 'dawn'        // Aube
  | 'sunrise'     // Lever du soleil
  | 'morning'     // Matin
  | 'midday'      // Midi
  | 'afternoon'   // Après-midi
  | 'sunset'      // Coucher du soleil
  | 'dusk'        // Crépuscule
  | 'night';      // Nuit

// Couleurs simplifiées pour chaque mode
const BACKGROUND_MODES = {
  night: {
    primary: '#1a202c',   // Bleu très sombre (plus doux)
    secondary: '#2d3748', // Bleu-gris foncé
    tertiary: '#4a5568'   // Gris-bleu moyen (plus doux pour la transition)
  },
  dawn: {
    primary: '#FFF5E6',   // Blanc crème très doux pour l'horizon
    secondary: '#FFE4B5', // Moccasin - beige chaud
    tertiary: '#B8D4F1'   // Bleu ciel très pâle
  },
  sunrise: {
    primary: '#FFB366',   // Orange pastel
    secondary: '#ADD8E6', // Bleu clair
    tertiary: '#4682B4'   // Bleu acier
  },
  morning: {
    primary: '#F0E68C',   // Jaune khaki
    secondary: '#ADD8E6', // Bleu clair
    tertiary: '#4682B4'   // Bleu acier
  },
  midday: {
    primary: '#87CEEB',   // Bleu ciel
    secondary: '#4682B4', // Bleu acier
    tertiary: '#1E3A8A'   // Bleu profond
  },
  afternoon: {
    primary: '#F0E68C',   // Jaune khaki
    secondary: '#ADD8E6', // Bleu clair
    tertiary: '#4682B4'   // Bleu acier
  },
  sunset: {
    primary: '#FFA07A',   // Saumon pastel
    secondary: '#ADD8E6', // Bleu clair
    tertiary: '#4682B4'   // Bleu acier
  },
  dusk: {
    primary: '#FFD4A3',   // Orange pastel doux
    secondary: '#ADD8E6', // Bleu clair
    tertiary: '#4682B4'   // Bleu acier
  }
};

// 🔧 NOUVEAU: Système de couleurs de transition pour ponts fluides
const TRANSITION_MODES = {
  'night-dawn': {
    primary: '#4A5F7A',   // Pont bleu-gris vers crème
    secondary: '#6B8CAF', // Transition douce
    tertiary: '#8BB3E8'   // Bleu plus clair
  },
  'dawn-sunrise': {
    primary: '#FFE4B5',   // Beige chaud vers orange
    secondary: '#FFD6A5', // Orange très pâle
    tertiary: '#B8D4F1'   // Maintien du bleu ciel
  },
  'sunrise-morning': {
    primary: '#FFD07A',   // Orange vers jaune
    secondary: '#B8E6D2', // Transition vers bleu clair
    tertiary: '#4682B4'   // Bleu acier stable
  },
  'morning-midday': {
    primary: '#BBE6F0',   // Jaune vers bleu ciel
    secondary: '#87CEEB', // Bleu ciel direct
    tertiary: '#4682B4'   // Bleu acier stable
  },
  'midday-afternoon': {
    primary: '#B8E6F0',   // Maintien bleu ciel
    secondary: '#96D4E6', // Légère transition
    tertiary: '#2E4A8A'   // Bleu légèrement plus chaud
  },
  'afternoon-sunset': {
    primary: '#FFCC99',   // Jaune vers saumon
    secondary: '#FFA999', // Saumon plus vif
    tertiary: '#4682B4'   // Bleu acier stable
  },
  'sunset-dusk': {
    primary: '#FFB899',   // Saumon vers orange doux
    secondary: '#FFD0A3', // Orange pastel
    tertiary: '#5695C4'   // Bleu plus doux
  },
  'dusk-night': {
    primary: '#4a5568',   // Gris-bleu doux vers sombre
    secondary: '#2d3748', // Bleu-gris intermédiaire plus doux
    tertiary: '#1a202c'   // Vers bleu très sombre
  }
};

// Interface pour les props du composant
interface DynamicBackgroundProps {
  children: React.ReactNode;
  skyMode: string;
}



const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children, skyMode }) => {
  const { userLocation, locationReady } = useLocation();
  const { getCurrentTime } = useTime();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<string>('night');

  
  const currentModeRef = useRef(skyMode);
  const backgroundRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const zoomTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const sunriseAnimationRef = useRef<SunriseAnimationRef>(null);

  // 🔧 CISCO: Background UNIQUE - Background.png seulement (simplification)
  const selectedBackground = '/Background.png'; // Background unique pour simplifier

  // 🔧 CISCO: Position simplifiée pour Background.png unique
  const getBackgroundPosition = (): string => {
    return 'center 75%'; // Position optimale pour Background.png
  };
  
  // Fonction pour déterminer le mode basé sur l'heure
  const getModeForTime = useCallback((date: Date): string => {
    if (locationReady && userLocation) {
      const sunTimes = SunCalc.getTimes(date, userLocation.lat, userLocation.lon);
      const currentTime = date.getTime();
      
      if (currentTime < sunTimes.dawn.getTime()) return 'night';
      if (currentTime < sunTimes.sunrise.getTime()) return 'dawn';
      if (currentTime < sunTimes.sunrise.getTime() + (2 * 60 * 60 * 1000)) return 'sunrise';
      if (currentTime < sunTimes.solarNoon.getTime() - (1 * 60 * 60 * 1000)) return 'morning';
      if (currentTime < sunTimes.solarNoon.getTime() + (3 * 60 * 60 * 1000)) return 'midday';
      if (currentTime < sunTimes.sunset.getTime() - (1 * 60 * 60 * 1000)) return 'afternoon';
      if (currentTime < sunTimes.sunset.getTime()) return 'sunset';
      if (currentTime < sunTimes.dusk.getTime()) return 'dusk';
      return 'night';
    } else {
      const hour = date.getHours();
      if (hour >= 5 && hour < 6) return 'dawn';
      if (hour >= 6 && hour < 8) return 'sunrise';
      if (hour >= 8 && hour < 11) return 'morning';
      if (hour >= 11 && hour < 15) return 'midday';
      if (hour >= 15 && hour < 18) return 'afternoon';
      if (hour >= 18 && hour < 20) return 'sunset';
      if (hour >= 20 && hour < 22) return 'dusk';
      return 'night';
    }
  }, [locationReady, userLocation]);



  // Fonction pour les transitions de nuages (à implémenter)
  const applyCloudTransition = (mode: BackgroundMode, duration: number) => {
    console.log(`☁️ Transition des nuages vers ${mode} (${duration}s)`);
    // Implémentation à ajouter
  };

  // Fonction pour les transitions d'étoiles (à implémenter)
  const applyStarsTransition = (mode: BackgroundMode, duration: number) => {
    console.log(`⭐ Transition des étoiles vers ${mode} (${duration}s)`);
    // Implémentation à ajouter
  };



  // 🔧 CISCO: Changement de mode avec CROSS FADE progressif TOUJOURS
  const setBackgroundMode = (mode: BackgroundMode) => {
    console.log(`🎨 Changement de mode vers: ${mode} depuis ${currentModeRef.current}`);

    // Si c'est le même mode, ne rien faire
    if (mode === currentModeRef.current) {
      console.log('🔄 Mode identique, pas de transition');
      return;
    }

    // Transition avec pont si modes adjacents
    const transitionKey = `${currentModeRef.current}-${mode}` as keyof typeof TRANSITION_MODES;
    if (TRANSITION_MODES[transitionKey]) {
      console.log(`🌉 Utilisation du pont de transition: ${transitionKey}`);
      // Appliquer d'abord la couleur de transition
      updateBackgroundWithBridge(mode, transitionKey);
    } else {
      // 🔧 AMÉLIORATION: Transition directe mais DOUCE pour modes non adjacents
      console.log(`🎨 Transition directe douce vers: ${mode}`);
      // ✅ CORRECTION: Ne pas changer currentMode immédiatement pour éviter le changement brutal
      updateBackgroundSmoothly(mode); // Cette fonction se chargera de mettre à jour le mode
    }
  };

  // 🔧 NOUVELLE FONCTION: Transition douce même pour les modes non adjacents
  const updateBackgroundSmoothly = (targetMode: BackgroundMode) => {
    if (!gradientRef.current) return;

    const targetColors = getColorsForMode(targetMode);
    
    setIsTransitioning(true);
    
    // Créer le dégradé final avec transition ultra douce
    let finalGradient;
    if (targetMode === 'dawn') {
      finalGradient = `linear-gradient(to top, ${targetColors.primary} 30%, ${targetColors.secondary} 60%, ${targetColors.tertiary} 100%)`;
    } else {
      finalGradient = `linear-gradient(to top, ${targetColors.primary} 50%, ${targetColors.secondary} 75%, ${targetColors.tertiary} 100%)`;
    }
    
    const targetBrightness = getBrightnessForMode(targetMode);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        currentModeRef.current = targetMode;
        console.log(`✨ Transition douce vers ${targetMode} terminée !`);
      }
    });

    // 🌊 CISCO: SYNCHRONISATION PARFAITE - 15 secondes avec easing très doux
    timelineRef.current.to(gradientRef.current, {
      backgroundImage: finalGradient,
      duration: 15.0, // CISCO: Harmonisation à 15 secondes pour synchronisation totale
      ease: "power1.inOut", // Easing plus doux que power2
      force3D: true,
      willChange: "background-image"
    });

    // ✨ CISCO: TRANSITION DE L'ÉCLAIRAGE - Synchronisée (durée adaptée selon le mode)
    const transitionDuration = targetMode === 'morning' ? 20.0 : 15.0; // 🔧 Mode matin = 20s, autres = 15s
    if (landscapeRef.current) {
      timelineRef.current.to(landscapeRef.current, {
        filter: `brightness(${targetBrightness})`,
        duration: transitionDuration, // 🔧 CISCO: Harmonisation adaptée
        ease: "power1.inOut"
      }, 0);
    }

  };

  // 🔧 NOUVELLE FONCTION: Transition avec pont intermédiaire
  const updateBackgroundWithBridge = (targetMode: BackgroundMode, transitionKey: keyof typeof TRANSITION_MODES) => {
    if (!gradientRef.current) return;

    const bridgeColors = TRANSITION_MODES[transitionKey];
    const targetColors = getColorsForMode(targetMode);
    
    setIsTransitioning(true);
    
    // Créer le dégradé de pont
    const bridgeGradient = `linear-gradient(to top, ${bridgeColors.primary} 50%, ${bridgeColors.secondary} 75%, ${bridgeColors.tertiary} 100%)`;
    
    // Créer le dégradé final
    let finalGradient;
    if (targetMode === 'dawn') {
      finalGradient = `linear-gradient(to top, ${targetColors.primary} 30%, ${targetColors.secondary} 60%, ${targetColors.tertiary} 100%)`;
    } else {
      finalGradient = `linear-gradient(to top, ${targetColors.primary} 50%, ${targetColors.secondary} 75%, ${targetColors.tertiary} 100%)`;
    }
    
    const targetBrightness = getBrightnessForMode(targetMode);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        currentModeRef.current = targetMode;
        setIsTransitioning(false);
        console.log(`✨ Transition avec pont vers ${targetMode} terminée !`);
      }
    });

    // 🌉 CISCO: PHASE 1 - Transition vers le pont (7.5 secondes)
    timelineRef.current.to(gradientRef.current, {
      backgroundImage: bridgeGradient,
      duration: 7.5, // CISCO: Première moitié des 15 secondes
      ease: "power1.inOut",
      force3D: true,
      willChange: "background-image"
    });

    // 🌉 CISCO: PHASE 2 - Transition du pont vers le mode final (7.5 secondes)
    timelineRef.current.to(gradientRef.current, {
      backgroundImage: finalGradient,
      duration: 7.5, // CISCO: Seconde moitié des 15 secondes
      ease: "power1.inOut",
      force3D: true,
      willChange: "background-image"
    }, 7.5); // CISCO: Démarre après 7.5 secondes

    // ✨ CISCO: TRANSITION DE L'ÉCLAIRAGE - Synchronisée (durée adaptée selon le mode)
    const transitionDuration = targetMode === 'morning' ? 20.0 : 15.0; // 🔧 Mode matin = 20s, autres = 15s
    if (landscapeRef.current) {
      timelineRef.current.to(landscapeRef.current, {
        filter: `brightness(${targetBrightness})`,
        duration: transitionDuration, // 🔧 CISCO: Harmonisation adaptée
        ease: "power1.inOut"
      }, 0);
    }

    // 🔧 CISCO: CROSS FADE DES NUAGES - SYNCHRONISÉE DANS LA TIMELINE
    timelineRef.current.call(() => {
      applyCloudTransition(targetMode, transitionDuration);
    }, [], 0.1); // 🔧 CISCO: Délai de 100ms pour synchronisation parfaite

    // 🔧 CISCO: SYNCHRONISATION DES ÉTOILES - MÊME TIMING QUE LES NUAGES
    timelineRef.current.call(() => {
      applyStarsTransition(targetMode, transitionDuration);
    }, [], 0.1); // 🔧 CISCO: Même délai pour synchronisation parfaite
  };

  // 🔧 FONCTION SIMPLIFIÉE: Obtenir les couleurs pour un mode donné
  const getColorsForMode = (mode: BackgroundMode) => {
    return BACKGROUND_MODES[mode];
  };

  // 🔧 FONCTION SIMPLIFIÉE: Calculer l'éclairage selon le mode
  const getBrightnessForMode = (mode: BackgroundMode): number => {
    switch (mode) {
      case 'night': return 0.2;
      case 'dawn': return 0.4;
      case 'sunrise': return 0.6;
      case 'morning': return 0.8;
      case 'midday': return 1.0;
      case 'afternoon': return 0.8;
      case 'sunset': return 0.6;
      case 'dusk': return 0.4;
      default: return 0.6;
    }
  };


  // 🔧 FONCTION PRINCIPALE: Transition progressive fluide entre modes
  const updateDynamicBackground = (mode?: BackgroundMode) => {
    if (!gradientRef.current) return;

    const targetMode = mode || skyMode as BackgroundMode;
    const colors = getColorsForMode(targetMode);
    
    // 🎬 INDICATEUR DE TRANSITION
    setIsTransitioning(true);
    setTransitionPhase('fade-in'); // Transition directe, pas de fade-out
    
    // 🔧 DÉGRADÉ MODIFIÉ: Pour l'aube - commence plus haut (30%)
    let gradient;
    if (targetMode === 'dawn') {
      gradient = `linear-gradient(to top, ${colors.primary} 30%, ${colors.secondary} 60%, ${colors.tertiary} 100%)`;
    } else {
      // Autres modes - commence au milieu de l'écran (50%)
      gradient = `linear-gradient(to top, ${colors.primary} 50%, ${colors.secondary} 75%, ${colors.tertiary} 100%)`;
    }
    
    const brightness = getBrightnessForMode(targetMode);

    console.log(`🎨 Transition progressive fluide vers ${targetMode}`);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        console.log(`✨ Transition vers ${targetMode} terminée !`);
      }
    });

    // 🌅 CISCO: TRANSITION DIRECTE - Changement progressif des couleurs (15 secondes)
    timelineRef.current.to(gradientRef.current, {
      backgroundImage: gradient,
      duration: 15.0, // CISCO: Harmonisation à 15 secondes
      ease: "power2.inOut",
      force3D: true,
      willChange: "background-image"
    });

    // ✨ CISCO: TRANSITION DE L'ÉCLAIRAGE - Synchronisée et progressive (durée adaptée)
    const transitionDuration = targetMode === 'morning' ? 20.0 : 15.0; // 🔧 Mode matin = 20s, autres = 15s
    if (landscapeRef.current) {
      timelineRef.current.to(landscapeRef.current, {
        filter: `brightness(${brightness})`,
        duration: transitionDuration, // 🔧 CISCO: Harmonisation adaptée
        ease: "power2.inOut"
      }, 0);
    }

  };

  // Animation de zoom du paysage
  const createLandscapeZoomAnimation = () => {
    if (!landscapeRef.current) return;
    if (zoomTimelineRef.current) {
      zoomTimelineRef.current.kill();
    }
    zoomTimelineRef.current = gsap.timeline({ repeat: -1, yoyo: false, force3D: true });
    zoomTimelineRef.current.to(landscapeRef.current, { scale: 1.15, duration: 45, ease: "power2.inOut" });
    zoomTimelineRef.current.to(landscapeRef.current, { scale: 1.15, duration: 5, ease: "none" });
    zoomTimelineRef.current.to(landscapeRef.current, { scale: 1.0, duration: 35, ease: "power2.out" });
    zoomTimelineRef.current.to(landscapeRef.current, { scale: 1.0, duration: 10, ease: "none" });
  };

  // 🌅 CISCO: Fonction publique pour déclencher l'animation de lever de soleil
  const triggerSunriseAnimation = () => {
    console.log('🌅 Déclenchement de l\'animation de lever de soleil depuis DynamicBackground');

    // CISCO: Animation maintenant disponible sur TOUS les backgrounds !
    console.log(`🌅 Animation de lever de soleil déclenchée en mode: ${currentModeRef.current}`);

    // Déclencher l'animation via la référence
    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerSunrise();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible');
    }
  };

  // 🌄 CISCO: Nouvelle fonction publique pour déclencher l'animation du matin
  const triggerMorningAnimation = () => {
    console.log('🌄 Déclenchement de l\'animation du matin depuis DynamicBackground');

    console.log(`🌄 Animation du matin déclenchée en mode: ${currentModeRef.current}`);

    // Déclencher l'animation via la référence
    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerMorning();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible pour le matin');
    }
  };

  // ☀️ CISCO: Nouvelle fonction publique pour déclencher l'animation du zénith
  const triggerMiddayAnimation = () => {
    console.log('☀️ Déclenchement de l\'animation du zénith depuis DynamicBackground');

    console.log(`☀️ Animation du zénith déclenchée en mode: ${currentModeRef.current}`);

    // Déclencher l'animation via la référence
    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerMidday();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible pour le zénith');
    }
  };

  // 🌅 CISCO: Nouvelle fonction publique pour déclencher l'animation de l'après-midi
  const triggerAfternoonAnimation = () => {
    console.log('🌅 Déclenchement de l\'animation de l\'après-midi depuis DynamicBackground');

    console.log(`🌅 Animation de l\'après-midi déclenchée en mode: ${currentModeRef.current}`);

    // Déclencher l'animation via la référence
    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerAfternoon();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible pour l\'après-midi');
    }
  };

  // 🌇 CISCO: Nouvelle fonction publique pour déclencher l'animation du coucher
  const triggerSunsetAnimation = () => {
    console.log('🌇 Déclenchement de l\'animation du coucher depuis DynamicBackground');

    console.log(`🌇 Animation du coucher déclenchée en mode: ${currentModeRef.current}`);

    // Déclencher l'animation via la référence
    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerSunset();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible pour le coucher');
    }
  };

  // 🌅 CISCO: Nouvelle fonction publique pour déclencher l'animation de l'aube
  const triggerDawnAnimation = () => {
    console.log('🌅 Déclenchement de l\'animation de l\'aube depuis DynamicBackground');

    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerDawn();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible pour l\'aube');
    }
  };

  // 🌆 CISCO: Nouvelle fonction publique pour déclencher l'animation du crépuscule
  const triggerDuskAnimation = () => {
    console.log('🌆 Déclenchement de l\'animation du crépuscule depuis DynamicBackground');

    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerDusk();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible pour le crépuscule');
    }
  };

  // 🌌 CISCO: Nouvelle fonction publique pour déclencher l'animation de la nuit profonde
  const triggerNightAnimation = () => {
    console.log('🌌 Déclenchement de l\'animation de la nuit profonde depuis DynamicBackground');

    if (sunriseAnimationRef.current) {
      sunriseAnimationRef.current.triggerNight();
    } else {
      console.warn('⚠️ Référence SunriseAnimation non disponible pour la nuit profonde');
    }
  };

  // Exposer les fonctions globalement
  (window as any).triggerSunriseAnimation = triggerSunriseAnimation;
  (window as any).triggerMorningAnimation = triggerMorningAnimation; // CISCO: Animation matin 9h
  (window as any).triggerMiddayAnimation = triggerMiddayAnimation; // CISCO: Animation zénith 12h
  (window as any).triggerAfternoonAnimation = triggerAfternoonAnimation; // CISCO: Animation après-midi 15h
  (window as any).triggerSunsetAnimation = triggerSunsetAnimation; // CISCO: Animation coucher 18h
  (window as any).triggerDawnAnimation = triggerDawnAnimation; // CISCO: Animation aube (soleil sous horizon)
  (window as any).triggerDuskAnimation = triggerDuskAnimation; // CISCO: Animation crépuscule (soleil derrière horizon)
  (window as any).triggerNightAnimation = triggerNightAnimation; // CISCO: Animation nuit profonde (soleil très bas)

  // Initialisation une seule fois
  useEffect(() => {
    if (gradientRef.current) {
      const initialColors = getColorsForMode(skyMode as BackgroundMode);
      const initialGradient = `linear-gradient(to top, ${initialColors.primary} 30%, ${initialColors.secondary} 60%, ${initialColors.tertiary} 100%)`;
      gsap.set(gradientRef.current, {
        backgroundImage: initialGradient
      });
    }

    createLandscapeZoomAnimation();
    updateDynamicBackground();

    return () => {
      if (timelineRef.current) timelineRef.current.kill();
      if (zoomTimelineRef.current) zoomTimelineRef.current.kill();
    };
  }, []);

  // Réagir aux changements de mode
  useEffect(() => {
    setBackgroundMode(skyMode as BackgroundMode);
  }, [skyMode]);

  // Effect pour mettre à jour l'arrière-plan automatiquement
  useEffect(() => {
    if (skyMode) {
      // Mode manuel via props
      updateDynamicBackground(skyMode as BackgroundMode);
    } else {
      // Mode automatique basé sur l'heure
      const currentMode = getModeForTime(getCurrentTime());
      updateDynamicBackground(currentMode as BackgroundMode);

      // Vérifier les changements toutes les minutes
      const interval = setInterval(() => {
        const newMode = getModeForTime(getCurrentTime());
        if (newMode !== currentModeRef.current) {
          updateDynamicBackground(newMode as BackgroundMode);
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, [skyMode, getCurrentTime, getModeForTime, updateDynamicBackground, transitionPhase]);



  return (
    <div
      ref={backgroundRef}
      className="relative overflow-hidden"
      style={{ minHeight: '100vh' }}
    >
      {/* Conteneur pour le dégradé - commence plus haut pour l'aube */}
      <div
        ref={gradientRef}
        className="absolute inset-0"
        style={{
          zIndex: 0,
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
          // ✅ CORRECTION: Supprimer le fallbackGradient qui entre en conflit avec GSAP
        }}
      />

      {/* Couches avec nuages réduits - Mode passé aux étoiles */}
      <AstronomicalLayer skyMode={skyMode as BackgroundMode} />
      <DiurnalLayer skyMode={skyMode as BackgroundMode} />

      {/* 🌅 CISCO: Animation de lever de soleil - Disponible sur TOUS les backgrounds */}
      <SunriseAnimation
        ref={sunriseAnimationRef}
        isVisible={true}
      />

      {/* Paysage avec éclairage dynamique - Background aléatoire */}
      <div
        ref={landscapeRef}
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: `url(${selectedBackground})`,
          backgroundPosition: getBackgroundPosition(), // Position pour Background.png
          backgroundSize: 'cover', // Taille standard pour tous les backgrounds
          zIndex: 5,
          transformOrigin: 'center center',
          willChange: 'transform, filter'
        }}
      />

      {/* Contenu principal */}
      <div className="relative" style={{ zIndex: 15 }}>
        {children}
      </div>

      {/* Indicateur de transition */}
      {isTransitioning && (
        <div className="fixed top-4 right-4 bg-[#0D9488]/90 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-50 shadow-lg border border-[#A550F5]/30">
          <div className="flex items-center gap-2">
            <div className="animate-pulse">
              ✨
            </div>
            <span className="text-sm font-medium">
              Transition...
            </span>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
          body, html {
            background: none !important;
            background-color: transparent !important;
          }
        `
      }} />
    </div>
  );
};

export default DynamicBackground;
