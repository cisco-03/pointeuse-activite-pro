import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import AstronomicalLayer from './AstronomicalLayer';
import DiurnalLayer from './DiurnalLayer';
import SunriseAnimation, { SunriseAnimationRef } from './SunriseAnimation';
import { useLocation } from '../Context/LocationContext';
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
  onModeChange?: (mode: BackgroundMode) => void; // 🔧 NOUVEAU: Callback pour notifier les changements de mode
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children, onModeChange }) => {
  const { userLocation, locationReady } = useLocation();

  // 🔧 CISCO: Ref pour éviter les problèmes de dépendances avec onModeChange
  const onModeChangeRef = useRef(onModeChange);

  // Mettre à jour la ref quand onModeChange change
  useEffect(() => {
    onModeChangeRef.current = onModeChange;
  }, [onModeChange]);

  // 🔧 FONCTION: Détection automatique du mode basé sur l'heure du PC
  const getAutoModeFromCurrentTime = (): BackgroundMode => {
    const now = new Date();

    // Si géolocalisation disponible, utiliser les calculs solaires précis
    if (locationReady && userLocation) {
      const sunTimes = SunCalc.getTimes(now, userLocation.lat, userLocation.lon);
      const currentTime = now.getTime();

      console.log(`🌍 Calcul du mode selon position géographique (${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)})`);

      if (currentTime < sunTimes.dawn.getTime()) {
        return 'night';
      } else if (currentTime < sunTimes.sunrise.getTime()) {
        return 'dawn';
      } else if (currentTime < sunTimes.sunrise.getTime() + (2 * 60 * 60 * 1000)) { // 2h après lever
        return 'sunrise';
      } else if (currentTime < sunTimes.solarNoon.getTime() - (1 * 60 * 60 * 1000)) { // 1h avant midi solaire
        return 'morning';
      } else if (currentTime < sunTimes.solarNoon.getTime() + (3 * 60 * 60 * 1000)) { // 3h après midi solaire
        return 'midday';
      } else if (currentTime < sunTimes.sunset.getTime() - (1 * 60 * 60 * 1000)) { // 1h avant coucher
        return 'afternoon';
      } else if (currentTime < sunTimes.sunset.getTime()) {
        return 'sunset';
      } else if (currentTime < sunTimes.dusk.getTime()) {
        return 'dusk';
      } else {
        return 'night';
      }
    } else {
      // Fallback: utiliser l'heure locale simple
      console.log('⚠️ Fallback: utilisation de l\'heure locale simple (pas de géolocalisation)');
      const hour = now.getHours();

      if (hour >= 5 && hour < 6) {
        return 'dawn';
      } else if (hour >= 6 && hour < 8) {
        return 'sunrise';
      } else if (hour >= 8 && hour < 11) {
        return 'morning';
      } else if (hour >= 11 && hour < 15) {
        return 'midday';
      } else if (hour >= 15 && hour < 18) {
        return 'afternoon';
      } else if (hour >= 18 && hour < 20) {
        return 'sunset';
      } else if (hour >= 20 && hour < 22) {
        return 'dusk';
      } else {
        return 'night';
      }
    }
  };

  // 🔧 SYSTÈME SIMPLIFIÉ - État pour le pilotage manuel avec détection automatique
  const [currentMode, setCurrentMode] = useState<BackgroundMode>(() => {
    // Initialisation avec détection automatique de l'heure
    const autoMode = getAutoModeFromCurrentTime();
    console.log(`🕐 Mode automatique détecté au démarrage: ${autoMode} (${new Date().toLocaleTimeString('fr-FR')})`);
    return autoMode;
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'fade-out' | 'fade-in'>('fade-out');

  // 🔧 CISCO: Background UNIQUE - Background.png seulement (simplification)
  const selectedBackground = '/Background.png'; // Background unique pour simplifier

  // 🔧 CISCO: Position simplifiée pour Background.png unique
  const getBackgroundPosition = (): string => {
    return 'center 75%'; // Position optimale pour Background.png
  };
  
  // Références pour l'animation
  const backgroundRef = useRef<HTMLDivElement>(null);
  const gradientRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const zoomTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // 🌅 CISCO: Référence pour l'animation de lever de soleil
  const sunriseAnimationRef = useRef<SunriseAnimationRef>(null);
  
  // 🌆 CISCO: NOUVELLE FONCTION - Transition progressive spéciale pour coucher de soleil - SYNCHRONISÉ AVEC DÉGRADÉ
  const applySunsetCloudTransition = (imgElement: HTMLImageElement, duration: number = 15.0) => {
    console.log(`🌆 Transition progressive coucher de soleil - Baisse luminosité sur ${duration}s`);

    // Filtre initial (lumineux/doré)
    const initialFilter = 'brightness(1.2) contrast(1.0) saturate(1.3) hue-rotate(10deg)';

    // Filtre final (plus sombre/orangé)
    const finalFilter = 'brightness(0.8) contrast(1.1) saturate(1.4) hue-rotate(20deg)';

    // Application immédiate du filtre initial
    gsap.set(imgElement, {
      filter: initialFilter
    });

    // Transition progressive vers le filtre final (synchronisée avec arrière-plan)
    gsap.to(imgElement, {
      filter: finalFilter,
      duration: duration, // CISCO: Même durée que dégradé arrière-plan (15s)
      ease: "power1.inOut", // Easing doux et naturel
      overwrite: true
    });
  };

  // 🔧 CISCO: CROSS FADE progressif pour nuages - SYNCHRONISÉ AVEC DÉGRADÉ
  const applyCloudTransition = (mode: BackgroundMode, duration: number = 15.0) => {
    const cloudTint = getCloudTintForMode(mode);
    const cloudElements = document.querySelectorAll('[data-cloud-element]');

    console.log(`🌤️ CROSS FADE progressif de ${cloudElements.length} nuages vers mode: ${mode} (${duration}s)`);
    console.log(`🌤️ Filtre nuages appliqué: ${cloudTint}`);

    cloudElements.forEach((cloudElement) => {
      const img = cloudElement.querySelector('img');
      if (img) {
        // 🌆 CISCO: TRAITEMENT SPÉCIAL pour mode SUNSET - Baisse progressive de luminosité
        if (mode === 'sunset') {
          applySunsetCloudTransition(img, duration);
        } else {
          // 🔧 CISCO: TRANSITION PROGRESSIVE PURE - Pas d'application immédiate
          gsap.to(img, {
            filter: cloudTint,
            duration: duration, // 🔧 CISCO: Durée complète pour synchronisation parfaite (30s)
            ease: "power1.inOut",
            overwrite: true
          });
        }
      }
    });
  };

  // 🔧 CISCO: NOUVELLE FONCTION - Synchronisation des étoiles avec les transitions principales
  const applyStarsTransition = (mode: BackgroundMode, duration: number = 15.0) => {
    // Synchroniser les étoiles fixes
    const fixedStarsContainer = document.querySelector('[class*="fixed-star"]')?.parentElement;
    if (fixedStarsContainer) {
      const visibility = mode === 'night' ? 1 : (mode === 'dusk' || mode === 'dawn' ? 0.3 : 0);
      console.log(`⭐ SYNCHRONISATION étoiles fixes vers opacité ${visibility} (${duration}s)`);

      gsap.to(fixedStarsContainer, {
        opacity: visibility,
        duration: duration,
        ease: "power1.inOut",
        overwrite: true
      });
    }

    // Synchroniser les étoiles filantes
    const shootingStarsContainer = document.querySelector('[class*="shooting-star"]')?.parentElement;
    if (shootingStarsContainer) {
      const shouldShow = ['night', 'dusk', 'dawn'].includes(mode);
      const targetOpacity = shouldShow ? (mode === 'night' ? 1 : 0.3) : 0;
      console.log(`🌠 SYNCHRONISATION étoiles filantes vers opacité ${targetOpacity} (${duration}s)`);

      gsap.to(shootingStarsContainer, {
        opacity: targetOpacity,
        duration: duration,
        ease: "power1.inOut",
        overwrite: true
      });
    }

    // Synchroniser les étoiles astronomiques
    const astronomicalStars = document.querySelectorAll('.star');
    if (astronomicalStars.length > 0) {
      const visibility = mode === 'night' ? 1 : (mode === 'dusk' || mode === 'dawn' ? 0.3 : 0);
      console.log(`🌌 SYNCHRONISATION ${astronomicalStars.length} étoiles astronomiques vers opacité ${visibility} (${duration}s)`);

      astronomicalStars.forEach((star) => {
        gsap.to(star as HTMLElement, {
          opacity: visibility,
          duration: duration,
          ease: "power1.inOut",
          overwrite: true
        });
      });
    }
  };

  // 🔧 CISCO: Changement de mode avec CROSS FADE progressif TOUJOURS
  const setBackgroundMode = (mode: BackgroundMode) => {
    console.log(`🎨 Changement de mode vers: ${mode} depuis ${currentMode}`);

    // Si c'est le même mode, ne rien faire
    if (mode === currentMode) {
      console.log('🔄 Mode identique, pas de transition');
      return;
    }

    // 🔧 CISCO: Les nuages seront synchronisés DANS les timelines GSAP
    console.log(`🌤️ Préparation transition nuages pour mode: ${mode}`);

    // Transition avec pont si modes adjacents
    const transitionKey = `${currentMode}-${mode}` as keyof typeof TRANSITION_MODES;
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
    setTransitionPhase('fade-in');
    
    // Créer le dégradé final avec transition ultra douce
    let finalGradient;
    if (targetMode === 'dawn') {
      finalGradient = `linear-gradient(to top, ${targetColors.primary} 30%, ${targetColors.secondary} 60%, ${targetColors.tertiary} 100%)`;
    } else {
      finalGradient = `linear-gradient(to top, ${targetColors.primary} 50%, ${targetColors.secondary} 75%, ${targetColors.tertiary} 100%)`;
    }
    
    const targetBrightness = getBrightnessForMode(targetMode);

    console.log(`🌊 Transition ultra douce vers: ${targetMode}`);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        setIsTransitioning(false);
        setCurrentMode(targetMode); // ✅ CORRECTION: Mettre à jour le mode seulement à la fin
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

    // 🔧 CISCO: CROSS FADE DES NUAGES - SYNCHRONISÉE DANS LA TIMELINE
    timelineRef.current.call(() => {
      applyCloudTransition(targetMode, transitionDuration);
    }, [], 0.1); // 🔧 CISCO: Délai de 100ms pour synchronisation parfaite

    // 🔧 CISCO: SYNCHRONISATION DES ÉTOILES - MÊME TIMING QUE LES NUAGES
    timelineRef.current.call(() => {
      applyStarsTransition(targetMode, transitionDuration);
    }, [], 0.1); // 🔧 CISCO: Même délai pour synchronisation parfaite
  };

  // 🔧 NOUVELLE FONCTION: Transition avec pont intermédiaire
  const updateBackgroundWithBridge = (targetMode: BackgroundMode, transitionKey: keyof typeof TRANSITION_MODES) => {
    if (!gradientRef.current) return;

    const bridgeColors = TRANSITION_MODES[transitionKey];
    const targetColors = getColorsForMode(targetMode);
    
    setIsTransitioning(true);
    setTransitionPhase('fade-in');
    
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

    console.log(`🌉 Transition avec pont: ${transitionKey} → ${targetMode}`);

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    timelineRef.current = gsap.timeline({
      onComplete: () => {
        setCurrentMode(targetMode);
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

  // 🔧 FONCTION SIMPLIFIÉE: Calculer les effets sur les nuages (optimisés)
  const getCloudTintForMode = (mode: BackgroundMode): string => {
    switch (mode) {
      case 'midday': return 'brightness(1.3) saturate(0.8) contrast(0.95) hue-rotate(0deg)'; // CISCO: Nuages très blancs/lumineux
      case 'morning': return 'brightness(1.1) saturate(1.0) contrast(1.05)';
      case 'afternoon': return 'brightness(1.1) saturate(1.0) contrast(1.05)';
      case 'dawn': return 'brightness(0.8) contrast(1.1) saturate(1.1) hue-rotate(5deg)';
      case 'sunrise': return 'brightness(0.9) contrast(1.1) saturate(1.2) hue-rotate(8deg)';
      case 'sunset': return 'brightness(1.0) contrast(1.1) saturate(1.3) hue-rotate(15deg)'; // CISCO: Nuages dorés/orangés, pas noirs
      case 'dusk': return 'brightness(0.6) contrast(1.15) saturate(1.2) hue-rotate(8deg)';
      case 'night': return 'brightness(0.3) contrast(1.2) saturate(0.7) hue-rotate(-10deg)';
      default: return 'brightness(1.0) saturate(1.0) contrast(1.0)';
    }
  };

  // 🔧 FONCTION PRINCIPALE: Transition progressive fluide entre modes
  const updateBackground = (mode?: BackgroundMode) => {
    if (!gradientRef.current) return;

    const targetMode = mode || currentMode;
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

    // 🔧 CISCO: CROSS FADE DES NUAGES - SYNCHRONISÉE DANS LA TIMELINE
    timelineRef.current.call(() => {
      applyCloudTransition(targetMode, transitionDuration);
    }, [], 0.1); // 🔧 CISCO: Délai de 100ms pour synchronisation parfaite

    // 🔧 CISCO: SYNCHRONISATION DES ÉTOILES - MÊME TIMING QUE LES NUAGES
    timelineRef.current.call(() => {
      applyStarsTransition(targetMode, transitionDuration);
    }, [], 0.1); // 🔧 CISCO: Même délai pour synchronisation parfaite
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

  // 🔧 FONCTION PUBLIQUE: Permet de changer le mode depuis l'extérieur
  (window as any).setBackgroundMode = setBackgroundMode;

  // 🌅 CISCO: Fonction publique pour déclencher l'animation de lever de soleil
  const triggerSunriseAnimation = () => {
    console.log('🌅 Déclenchement de l\'animation de lever de soleil depuis DynamicBackground');

    // CISCO: Animation maintenant disponible sur TOUS les backgrounds !
    console.log(`🌅 Animation de lever de soleil déclenchée en mode: ${currentMode}`);

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

    console.log(`🌄 Animation du matin déclenchée en mode: ${currentMode}`);

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

    console.log(`☀️ Animation du zénith déclenchée en mode: ${currentMode}`);

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

    console.log(`🌅 Animation de l\'après-midi déclenchée en mode: ${currentMode}`);

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

    console.log(`🌇 Animation du coucher déclenchée en mode: ${currentMode}`);

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

  // 🔧 CISCO: DÉSACTIVÉ - Re-synchronisation automatique pour éviter les changements non désirés
  // useEffect(() => {
  //   if (locationReady) {
  //     const newAutoMode = getAutoModeFromCurrentTime();
  //     if (newAutoMode !== currentMode) {
  //       console.log(`🌍 Géolocalisation disponible - Mise à jour automatique du mode: ${currentMode} → ${newAutoMode}`);
  //       setCurrentMode(newAutoMode);
  //     }
  //   }
  // }, [locationReady, currentMode]);

  // Initialisation une seule fois
  useEffect(() => {
    if (gradientRef.current) {
      const initialColors = getColorsForMode(currentMode);
      const initialGradient = `linear-gradient(to top, ${initialColors.primary} 30%, ${initialColors.secondary} 60%, ${initialColors.tertiary} 100%)`;
      gsap.set(gradientRef.current, {
        backgroundImage: initialGradient
      });
    }

    createLandscapeZoomAnimation();
    updateBackground();

    // 🔧 NOUVEAU: Message de confirmation de la détection automatique
    console.log(`
🎯 DÉTECTION AUTOMATIQUE ACTIVÉE !

✅ Mode détecté: ${currentMode}
🕐 Heure actuelle: ${new Date().toLocaleTimeString('fr-FR')}
🌍 Géolocalisation: ${locationReady ? 'Activée (calculs précis)' : 'En attente (calculs standards)'}

L'utilisateur peut toujours changer le mode manuellement via le panneau de contrôle.
    `);

    return () => {
      if (timelineRef.current) timelineRef.current.kill();
      if (zoomTimelineRef.current) zoomTimelineRef.current.kill();
    };
  }, []);

  // 🔧 CISCO: Notifier le mode initial au montage - AVEC currentMode dans les dépendances
  useEffect(() => {
    if (onModeChangeRef.current) {
      console.log(`🎵 DynamicBackground: Notification du mode initial: ${currentMode}`);
      onModeChangeRef.current(currentMode);
    }
  }, [currentMode]); // 🔧 CISCO: Inclure currentMode pour éviter les valeurs obsolètes

  // Réagir aux changements de mode
  useEffect(() => {
    updateBackground();
    // 🔧 NOUVEAU: Notifier le parent du changement de mode
    if (onModeChangeRef.current) {
      onModeChangeRef.current(currentMode);
    }
  }, [currentMode]); // 🔧 CISCO: Seulement currentMode comme dépendance

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
      <AstronomicalLayer skyMode={currentMode} />
      <DiurnalLayer />

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
              {transitionPhase === 'fade-out' ? '�' : '✨'}
            </div>
            <span className="text-sm font-medium">
              {transitionPhase === 'fade-out' ? 'Fade-out...' : 'Fade-in...'}
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
