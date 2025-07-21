import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import * as SunCalc from 'suncalc';
import AstronomicalLayer from './AstronomicalLayer';
import DiurnalLayer from './DiurnalLayer';
import { useTime } from './TimeContext';
import { useLocation } from './LocationContext';

// Types pour les couleurs du cycle solaire naturel
interface SolarPhaseColor {
  phase: string;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

// Énumération des phases solaires pour une progression naturelle
enum SolarPhase {
  DEEP_NIGHT = 'deep_night',
  ASTRONOMICAL_DAWN = 'astronomical_dawn',
  NAUTICAL_DAWN = 'nautical_dawn',
  CIVIL_DAWN = 'civil_dawn',
  SUNRISE = 'sunrise',
  MORNING = 'morning',
  MIDDAY = 'midday',
  AFTERNOON = 'afternoon',
  CIVIL_DUSK = 'civil_dusk',
  SUNSET = 'sunset',
  NAUTICAL_DUSK = 'nautical_dusk',
  ASTRONOMICAL_DUSK = 'astronomical_dusk'
}

// Palette de couleurs naturelles basée sur les phases solaires réelles
// Format: { primary: bas (horizon), secondary: milieu, tertiary: haut (ciel) }
// Couleurs inspirées de la nature, douces et réalistes
const SOLAR_PHASE_COLORS: SolarPhaseColor[] = [
  // Nuit profonde - Bleu-gris naturel très sombre 🌌
  {
    phase: SolarPhase.DEEP_NIGHT,
    colors: {
      primary: '#2c3e50',   // Bleu-gris sombre naturel
      secondary: '#34495e', // Gris-bleu moyen
      tertiary: '#1a252f'   // Bleu très sombre
    }
  },

  // Aube astronomique - Premières lueurs très subtiles 🌠
  {
    phase: SolarPhase.ASTRONOMICAL_DAWN,
    colors: {
      primary: '#3a4a5c',   // Bleu-gris légèrement plus clair
      secondary: '#4a5568', // Gris-bleu
      tertiary: '#2c3e50'   // Bleu-gris sombre
    }
  },

  // Aube nautique - Horizon commence à se distinguer ⚓
  {
    phase: SolarPhase.NAUTICAL_DAWN,
    colors: {
      primary: '#4a5d70',   // Bleu-gris plus clair
      secondary: '#5a6b7d', // Gris-bleu clair
      tertiary: '#3a4a5c'   // Bleu-gris moyen
    }
  },

  // Aube civile - Premières couleurs chaudes très douces 🌅
  {
    phase: SolarPhase.CIVIL_DAWN,
    colors: {
      primary: '#6b7d8a',   // Gris-bleu doux
      secondary: '#7a8c99', // Gris-bleu clair
      tertiary: '#4a5d70'   // Bleu-gris
    }
  },

  // Lever du soleil - Couleurs chaudes naturelles mais douces 🌄
  {
    phase: SolarPhase.SUNRISE,
    colors: {
      primary: '#d4a574',   // Beige doré doux
      secondary: '#b8956f', // Brun-beige
      tertiary: '#8a9ba8'   // Gris-bleu clair
    }
  },

  // Matin - Transition vers les bleus clairs du jour ☀️
  {
    phase: SolarPhase.MORNING,
    colors: {
      primary: '#e6f2ff',   // Bleu très clair, presque blanc
      secondary: '#cce7ff', // Bleu clair doux
      tertiary: '#b3daff'   // Bleu clair
    }
  },

  // Midi - Bleu ciel naturel, pas trop saturé ☀️
  {
    phase: SolarPhase.MIDDAY,
    colors: {
      primary: '#f0f8ff',   // Blanc-bleu très doux
      secondary: '#e6f3ff', // Bleu très clair
      tertiary: '#d1e7ff'   // Bleu clair naturel
    }
  },

  // Après-midi - Maintien des bleus avec légère chaleur 🌤️
  {
    phase: SolarPhase.AFTERNOON,
    colors: {
      primary: '#f5f8fa',   // Blanc cassé très doux
      secondary: '#e8f1f5', // Gris-bleu très clair
      tertiary: '#dae8f0'   // Bleu-gris clair
    }
  },

  // Crépuscule civil - Début des couleurs chaudes douces 🌆
  {
    phase: SolarPhase.CIVIL_DUSK,
    colors: {
      primary: '#f0e6d6',   // Beige très doux
      secondary: '#e6dcc6', // Beige-gris
      tertiary: '#d6ccb6'   // Beige plus sombre
    }
  },

  // Coucher du soleil - Couleurs chaudes naturelles 🌅
  {
    phase: SolarPhase.SUNSET,
    colors: {
      primary: '#e6c2a6',   // Beige-orange doux
      secondary: '#d4a574', // Beige doré
      tertiary: '#c2956f'   // Brun-beige
    }
  },

  // Crépuscule nautique - Transition vers les bleus sombres ⚓
  {
    phase: SolarPhase.NAUTICAL_DUSK,
    colors: {
      primary: '#8a9ba8',   // Gris-bleu
      secondary: '#7a8c99', // Gris-bleu plus sombre
      tertiary: '#6b7d8a'   // Gris-bleu sombre
    }
  },

  // Crépuscule astronomique - Retour vers la nuit 🌠
  {
    phase: SolarPhase.ASTRONOMICAL_DUSK,
    colors: {
      primary: '#4a5d70',   // Bleu-gris sombre
      secondary: '#3a4a5c', // Bleu-gris plus sombre
      tertiary: '#2c3e50'   // Bleu-gris très sombre
    }
  }
];

// Interface pour les props du composant
interface DynamicBackgroundProps {
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const { getCurrentTime } = useTime();
  const { userLocation, locationReady } = useLocation();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const zoomTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const lastUpdateRef = useRef<string>('');
  const animationFrameRef = useRef<number | null>(null);
  const [landscapeBrightness, setLandscapeBrightness] = useState(1);

  // Fonction pour déterminer la phase solaire actuelle basée sur SunCalc
  const getCurrentSolarPhase = (currentTime: Date): SolarPhase => {
    if (!locationReady) return SolarPhase.DEEP_NIGHT;

    const sunTimes = SunCalc.getTimes(currentTime, userLocation.lat, userLocation.lon);
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;

    // Convertir les heures SunCalc en format décimal
    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;
    const civilDawn = sunTimes.dawn.getHours() + sunTimes.dawn.getMinutes() / 60;
    const civilDusk = sunTimes.dusk.getHours() + sunTimes.dusk.getMinutes() / 60;
    const nauticalDawn = sunTimes.nauticalDawn.getHours() + sunTimes.nauticalDawn.getMinutes() / 60;
    const nauticalDusk = sunTimes.nauticalDusk.getHours() + sunTimes.nauticalDusk.getMinutes() / 60;
    const astronomicalDawn = sunTimes.nightEnd.getHours() + sunTimes.nightEnd.getMinutes() / 60;
    const astronomicalDusk = sunTimes.night.getHours() + sunTimes.night.getMinutes() / 60;

    // Déterminer la phase solaire actuelle avec progression naturelle
    if (currentHour >= sunrise + 2 && currentHour <= sunset - 2) {
      // Plein jour - distinguer matin, midi, après-midi
      if (currentHour < sunrise + 4) return SolarPhase.MORNING;
      if (currentHour >= 11.5 && currentHour <= 13.5) return SolarPhase.MIDDAY;
      return SolarPhase.AFTERNOON;
    }

    if (currentHour >= sunrise && currentHour < sunrise + 2) return SolarPhase.SUNRISE;
    if (currentHour >= civilDawn && currentHour < sunrise) return SolarPhase.CIVIL_DAWN;
    if (currentHour >= nauticalDawn && currentHour < civilDawn) return SolarPhase.NAUTICAL_DAWN;
    if (currentHour >= astronomicalDawn && currentHour < nauticalDawn) return SolarPhase.ASTRONOMICAL_DAWN;

    if (currentHour > sunset - 2 && currentHour <= sunset) return SolarPhase.CIVIL_DUSK;
    if (currentHour > sunset && currentHour <= sunset + 2) return SolarPhase.SUNSET;
    if (currentHour > civilDusk && currentHour <= nauticalDusk) return SolarPhase.NAUTICAL_DUSK;
    if (currentHour > nauticalDusk && currentHour <= astronomicalDusk) return SolarPhase.ASTRONOMICAL_DUSK;

    // Nuit profonde
    return SolarPhase.DEEP_NIGHT;
  };

  // Fonction pour obtenir les couleurs d'une phase solaire
  const getColorsForPhase = (phase: SolarPhase): { primary: string; secondary: string; tertiary: string } => {
    const phaseColor = SOLAR_PHASE_COLORS.find(pc => pc.phase === phase);
    return phaseColor ? phaseColor.colors : SOLAR_PHASE_COLORS[0].colors;
  };

  // Fonction pour interpoler entre deux couleurs avec courbe d'easing douce
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    // Appliquer une courbe d'easing pour des transitions plus naturelles
    const easedFactor = factor < 0.5
      ? 2 * factor * factor
      : 1 - Math.pow(-2 * factor + 2, 2) / 2;

    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');

    const r1 = parseInt(hex1.substring(0, 2), 16);
    const g1 = parseInt(hex1.substring(2, 4), 16);
    const b1 = parseInt(hex1.substring(4, 6), 16);

    const r2 = parseInt(hex2.substring(0, 2), 16);
    const g2 = parseInt(hex2.substring(2, 4), 16);
    const b2 = parseInt(hex2.substring(4, 6), 16);

    const r = Math.round(r1 + (r2 - r1) * easedFactor);
    const g = Math.round(g1 + (g2 - g1) * easedFactor);
    const b = Math.round(b1 + (b2 - b1) * easedFactor);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Fonction pour calculer la luminosité du paysage basée sur la position solaire réelle
  const calculateLandscapeBrightness = (currentTime: Date): number => {
    if (!locationReady) return 0.2; // Nuit par défaut si géolocalisation pas prête

    const sunTimes = SunCalc.getTimes(currentTime, userLocation.lat, userLocation.lon);
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;

    // Convertir les heures SunCalc en format décimal
    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;
    const civilDawn = sunTimes.dawn.getHours() + sunTimes.dawn.getMinutes() / 60;
    const civilDusk = sunTimes.dusk.getHours() + sunTimes.dusk.getMinutes() / 60;
    const nauticalDawn = sunTimes.nauticalDawn.getHours() + sunTimes.nauticalDawn.getMinutes() / 60;
    const nauticalDusk = sunTimes.nauticalDusk.getHours() + sunTimes.nauticalDusk.getMinutes() / 60;

    // Plein jour - luminosité maximale
    if (currentHour >= sunrise + 1 && currentHour <= sunset - 1) {
      return 1.0; // Pleine luminosité
    }

    // Lever du soleil - transition progressive vers la pleine luminosité
    if (currentHour >= sunrise && currentHour < sunrise + 1) {
      const progress = (currentHour - sunrise);
      return 0.6 + (0.4 * progress); // De 60% à 100%
    }

    // Aube civile - augmentation de la luminosité
    if (currentHour >= civilDawn && currentHour < sunrise) {
      const progress = (currentHour - civilDawn) / (sunrise - civilDawn);
      return 0.3 + (0.3 * progress); // De 30% à 60%
    }

    // Aube nautique - premières lueurs
    if (currentHour >= nauticalDawn && currentHour < civilDawn) {
      const progress = (currentHour - nauticalDawn) / (civilDawn - nauticalDawn);
      return 0.2 + (0.1 * progress); // De 20% à 30%
    }

    // Coucher du soleil - transition progressive vers l'obscurité
    if (currentHour > sunset - 1 && currentHour <= sunset) {
      const progress = (currentHour - (sunset - 1));
      return 1.0 - (0.4 * progress); // De 100% à 60%
    }

    // Crépuscule civil - diminution de la luminosité
    if (currentHour > sunset && currentHour <= civilDusk) {
      const progress = (currentHour - sunset) / (civilDusk - sunset);
      return 0.6 - (0.3 * progress); // De 60% à 30%
    }

    // Crépuscule nautique - dernières lueurs
    if (currentHour > civilDusk && currentHour <= nauticalDusk) {
      const progress = (currentHour - civilDusk) / (nauticalDusk - civilDusk);
      return 0.3 - (0.1 * progress); // De 30% à 20%
    }

    // Nuit profonde
    return 0.2; // 20% de luminosité pour la nuit
  };

  // Fonction pour obtenir les couleurs actuelles basées sur la position solaire réelle
  const getCurrentColors = () => {
    const now = getCurrentTime(); // Utiliser le temps du contexte (réel ou simulé)

    if (!locationReady) {
      // Si la géolocalisation n'est pas prête, utiliser les couleurs de nuit profonde
      return getColorsForPhase(SolarPhase.DEEP_NIGHT);
    }

    // Obtenir la phase solaire actuelle
    const currentPhase = getCurrentSolarPhase(now);
    const currentColors = getColorsForPhase(currentPhase);

    // Pour une progression linéaire plus fluide, on peut interpoler entre phases adjacentes
    // basé sur la position précise du soleil
    const sunTimes = SunCalc.getTimes(now, userLocation.lat, userLocation.lon);
    const currentHour = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

    // Calculer un facteur de progression pour l'interpolation entre phases
    let interpolationFactor = 0;
    let nextPhase = currentPhase;

    // Déterminer la phase suivante et le facteur d'interpolation pour une progression linéaire
    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;
    const civilDawn = sunTimes.dawn.getHours() + sunTimes.dawn.getMinutes() / 60;
    const civilDusk = sunTimes.dusk.getHours() + sunTimes.dusk.getMinutes() / 60;

    // Interpolation linéaire entre les phases pour des transitions ultra-fluides
    if (currentPhase === SolarPhase.CIVIL_DAWN && currentHour < sunrise) {
      const progress = (currentHour - civilDawn) / (sunrise - civilDawn);
      interpolationFactor = Math.max(0, Math.min(1, progress));
      nextPhase = SolarPhase.SUNRISE;
    } else if (currentPhase === SolarPhase.SUNRISE && currentHour < sunrise + 2) {
      const progress = (currentHour - sunrise) / 2;
      interpolationFactor = Math.max(0, Math.min(1, progress));
      nextPhase = SolarPhase.MORNING;
    } else if (currentPhase === SolarPhase.CIVIL_DUSK && currentHour > civilDusk) {
      const progress = (currentHour - civilDusk) / (sunset - civilDusk);
      interpolationFactor = Math.max(0, Math.min(1, progress));
      nextPhase = SolarPhase.SUNSET;
    }

    // Si on a une interpolation, mélanger les couleurs
    if (interpolationFactor > 0 && nextPhase !== currentPhase) {
      const nextColors = getColorsForPhase(nextPhase);
      return {
        primary: interpolateColor(currentColors.primary, nextColors.primary, interpolationFactor),
        secondary: interpolateColor(currentColors.secondary, nextColors.secondary, interpolationFactor),
        tertiary: interpolateColor(currentColors.tertiary, nextColors.tertiary, interpolationFactor)
      };
    }

    return currentColors;
  };

  // Fonction pour mettre à jour l'arrière-plan avec optimisations
  const updateBackground = () => {
    if (!backgroundRef.current) return;

    const now = getCurrentTime(); // Utiliser le temps du contexte (réel ou simulé)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Calcul précis de l'heure avec minutes et secondes
    const preciseHour = currentHour + currentMinute / 60 + currentSecond / 3600;

    const colors = getCurrentColors();
    // Dégradé optimisé pour PNG transparent avec hauteur limitée
    // Ajustement précis pour maximiser l'effet visuel dans l'espace disponible
    // Primary (horizon) à 25%, Secondary (milieu) à 50%, Tertiary (ciel) à 85%
    // Cela permet une meilleure répartition des couleurs dans l'espace visible
    const gradient = `linear-gradient(to top, ${colors.primary} 25%, ${colors.secondary} 50%, ${colors.tertiary} 85%)`;

    // Calculer la nouvelle luminosité du paysage
    const newBrightness = calculateLandscapeBrightness(now);

    // 🔍 DEBUG: Log pour comprendre le système solaire
    if (locationReady) {
      const currentPhase = getCurrentSolarPhase(now);
      const sunTimes = SunCalc.getTimes(now, userLocation.lat, userLocation.lon);
      console.log(`🎨 BACKGROUND SOLAIRE: ${preciseHour.toFixed(2)}h | Phase: ${currentPhase} | 🌅${sunTimes.sunrise.toLocaleTimeString()} | 🌇${sunTimes.sunset.toLocaleTimeString()} | Luminosité: ${newBrightness.toFixed(2)}`);
    } else {
      console.log(`🎨 BACKGROUND: ${preciseHour.toFixed(2)}h | Géolocalisation en attente... | Luminosité: ${newBrightness.toFixed(2)}`);
    }

    // Éviter les mises à jour inutiles si les couleurs n'ont pas changé
    const updateKey = `${gradient}-${newBrightness}`;
    if (lastUpdateRef.current === updateKey) return;
    lastUpdateRef.current = updateKey;

    // Mettre à jour l'état de la luminosité
    setLandscapeBrightness(newBrightness);

    // Annuler l'animation précédente pour éviter les conflits
    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    // 🔍 DEBUG: Forcer l'application directe du CSS avant GSAP
    if (backgroundRef.current) {
      console.log(`🎨 AVANT GSAP: background actuel = ${backgroundRef.current.style.background}`);
      backgroundRef.current.style.background = gradient;
      console.log(`🎨 APRÈS CSS: background forcé = ${backgroundRef.current.style.background}`);
    }

    // Animation ultra-fluide avec GSAP optimisée pour des transitions harmoniques
    timelineRef.current = gsap.timeline();
    timelineRef.current.to(backgroundRef.current, {
      background: gradient,
      duration: 2.0, // Transition plus longue pour plus de fluidité
      ease: "power2.inOut", // Courbe d'easing plus douce et naturelle
      force3D: true, // Utiliser l'accélération GPU
      willChange: "background",
      onComplete: () => {
        console.log(`🎨 GSAP TERMINÉ: background final = ${backgroundRef.current?.style.background}`);
      }
    });

    // Animation synchronisée de la luminosité du paysage
    if (landscapeRef.current) {
      timelineRef.current.to(landscapeRef.current, {
        filter: `brightness(${newBrightness})`,
        duration: 2.0, // Même durée que le dégradé pour une synchronisation parfaite
        ease: "power2.inOut" // Même courbe d'easing pour une harmonie parfaite
      }, 0); // Démarrer en même temps que l'animation du fond
    }
  };

  // Fonction optimisée pour les mises à jour en temps réel
  const scheduleUpdate = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      updateBackground();
      // Programmer la prochaine mise à jour
      setTimeout(scheduleUpdate, 1000);
    });
  };

  // Créer l'animation de zoom profond sur le paysage avec retour à la position initiale
  const createLandscapeZoomAnimation = () => {
    if (!landscapeRef.current) return;

    // Nettoyer l'animation précédente
    if (zoomTimelineRef.current) {
      zoomTimelineRef.current.kill();
    }

    // Animation de zoom plus profond et immersif
    zoomTimelineRef.current = gsap.timeline({
      repeat: -1,
      yoyo: false,
      force3D: true,
      willChange: "transform"
    });

    // Phase 1 : Zoom in progressif et plus profond (de 100% à 115% en 45 secondes)
    // Zoom plus profond pour une expérience plus immersive
    zoomTimelineRef.current.to(landscapeRef.current, {
      scale: 1.15, // Zoom plus profond (15% au lieu de 5%)
      duration: 45, // Plus long pour un effet plus contemplatif
      ease: "power2.inOut" // Courbe plus douce pour un effet naturel
    });

    // Phase 2 : Maintien du zoom maximum (pause de 5 secondes)
    // Permet d'apprécier la profondeur avant le retour
    zoomTimelineRef.current.to(landscapeRef.current, {
      scale: 1.15,
      duration: 5,
      ease: "none"
    });

    // Phase 3 : Retour progressif à l'état initial (de 115% à 100% en 35 secondes)
    // Retour plus rapide que l'aller pour créer un rythme naturel
    zoomTimelineRef.current.to(landscapeRef.current, {
      scale: 1.0,
      duration: 35,
      ease: "power2.out" // Décélération douce pour un retour naturel
    });

    // Phase 4 : Pause à l'état initial (10 secondes)
    // Permet de bien percevoir le retour à la position de départ
    zoomTimelineRef.current.to(landscapeRef.current, {
      scale: 1.0,
      duration: 10,
      ease: "none"
    });

    console.log('🔍 Animation de zoom profond du paysage initialisée (cycle de 95 secondes - zoom 15%)');
  };

  // useEffect pour l'initialisation (une seule fois)
  useEffect(() => {
    // Mise à jour initiale
    updateBackground();

    // Démarrer l'animation de zoom subtil
    createLandscapeZoomAnimation();

    // Démarrer le cycle de mise à jour optimisé
    scheduleUpdate();

    // Nettoyage complet
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (zoomTimelineRef.current) {
        zoomTimelineRef.current.kill();
      }
    };
  }, []); // Une seule fois au montage

  // Effet pour les changements de position (sans relancer les animations)
  useEffect(() => {
    if (locationReady && backgroundRef.current) {
      console.log(`🌍 POSITION CHANGÉE: ${userLocation.lat.toFixed(4)}, ${userLocation.lon.toFixed(4)} - Recalcul du dégradé...`);
      // Mise à jour immédiate et unique du gradient
      const colors = getCurrentColors();
      const gradient = `linear-gradient(to top, ${colors.primary} 25%, ${colors.secondary} 50%, ${colors.tertiary} 85%)`;
      backgroundRef.current.style.background = gradient;
    }
  }, [userLocation.lat, userLocation.lon, locationReady]);



  return (
    <div
      ref={backgroundRef}
      className="min-h-screen transition-all duration-500 ease-out relative overflow-hidden"
      style={{
        background: 'linear-gradient(to top, #4A5568 30%, #34495E 60%, #232B3E 100%)'
      }}
    >
      <AstronomicalLayer />
      <DiurnalLayer />

      {/* Image de paysage avec effet de luminosité dynamique et zoom subtil */}
      <div
        ref={landscapeRef}
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: 'url(/Background.png)',
          backgroundPosition: 'bottom center',
          backgroundSize: 'cover',
          zIndex: 5, // Devant les étoiles (z-index 1) mais derrière le contenu (z-index 10+)
          filter: `brightness(${landscapeBrightness})`,
          transition: 'filter 0.5s ease-out',
          transformOrigin: 'center center', // Point d'origine pour le zoom
          willChange: 'transform, filter' // Optimisation GPU
        }}
      />

      {children}
    </div>
  );
};

export default DynamicBackground;
