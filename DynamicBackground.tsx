import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import AstronomicalLayer from './AstronomicalLayer';
import DiurnalLayer from './DiurnalLayer';
import { useTime } from './TimeContext';

// Types pour les couleurs du cycle jour/nuit
interface TimeColor {
  hour: number;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

// Palette de couleurs pour chaque moment de la journée - NOUVELLES PALETTES HARMONIQUES
// Format: { primary: bas (horizon), secondary: milieu, tertiary: haut (ciel) }
const TIME_COLORS: TimeColor[] = [
  // Nuit profonde (0h-4h) - Palette "Nuit Profonde" 🌌
  { hour: 0, colors: { primary: '#4A5568', secondary: '#34495E', tertiary: '#232B3E' } },
  { hour: 1, colors: { primary: '#4A5568', secondary: '#34495E', tertiary: '#232B3E' } },
  { hour: 2, colors: { primary: '#4A5568', secondary: '#34495E', tertiary: '#232B3E' } },
  { hour: 3, colors: { primary: '#4A5568', secondary: '#34495E', tertiary: '#232B3E' } },
  { hour: 4, colors: { primary: '#4A5568', secondary: '#34495E', tertiary: '#232B3E' } },

  // Premières lueurs de l'aube (5h-7h) - Palette "Aube Réaliste" 🌅
  // Basée sur une palette photographique réelle d'aube avec transitions progressives
  // 5h: Rouge corail intense au début de l'aube
  { hour: 5, colors: { primary: '#ce6a6b', secondary: '#bed3c3', tertiary: '#212e53' } },
  // 6h: Rose saumon avec transition vers teal
  { hour: 6, colors: { primary: '#ebaca2', secondary: '#4a919e', tertiary: '#212e53' } },
  // 7h: Maintien des couleurs roses-teal avant transition matinale
  { hour: 7, colors: { primary: '#ebaca2', secondary: '#4a919e', tertiary: '#212e53' } },

  // Matin - Transition douce depuis l'aube vers "Journée Céleste" (8h-11h) ☀️
  { hour: 8, colors: { primary: '#D4E6F1', secondary: '#85C1E9', tertiary: '#5DADE2' } },
  { hour: 9, colors: { primary: '#E6F3FF', secondary: '#C1E1F4', tertiary: '#A7C7E7' } },
  { hour: 10, colors: { primary: '#E6F3FF', secondary: '#C1E1F4', tertiary: '#A7C7E7' } },
  { hour: 11, colors: { primary: '#E6F3FF', secondary: '#C1E1F4', tertiary: '#A7C7E7' } },

  // Midi - Pleine "Journée Céleste" (12h-14h) ☀️
  { hour: 12, colors: { primary: '#E6F3FF', secondary: '#C1E1F4', tertiary: '#A7C7E7' } },
  { hour: 13, colors: { primary: '#E6F3FF', secondary: '#C1E1F4', tertiary: '#A7C7E7' } },
  { hour: 14, colors: { primary: '#E6F3FF', secondary: '#C1E1F4', tertiary: '#A7C7E7' } },

  // Après-midi - Transition vers le crépuscule (15h-17h) 🌤️
  { hour: 15, colors: { primary: '#E6F3FF', secondary: '#C1E1F4', tertiary: '#A7C7E7' } },
  { hour: 16, colors: { primary: '#F0E6FA', secondary: '#D8BFD8', tertiary: '#C1E1F4' } },
  { hour: 17, colors: { primary: '#FAA0A0', secondary: '#D8BFD8', tertiary: '#E5E5FA' } },

  // Crépuscule coucher de soleil (18h-20h) - Palette "Coucher de Soleil Réaliste" 🌅
  // Basée sur votre palette photographique de coucher de soleil
  // 18h05 : Début du coucher - tons dorés vers l'horizon, violets en haut
  { hour: 18, colors: { primary: '#ffb937', secondary: '#f17133', tertiary: '#654b62' } },
  // 19h : Intensification des oranges et rouges, violets plus profonds
  { hour: 19, colors: { primary: '#f17133', secondary: '#b93d23', tertiary: '#553753' } },
  // 20h : Fin du coucher - tons plus sombres, transition vers la nuit
  { hour: 20, colors: { primary: '#b2856e', secondary: '#b93d23', tertiary: '#553753' } },

  // Soirée - Transition vers la nuit profonde (21h-23h) 🌙
  { hour: 21, colors: { primary: '#6A5ACD', secondary: '#483D8B', tertiary: '#2F2F4F' } },
  { hour: 22, colors: { primary: '#4A5568', secondary: '#34495E', tertiary: '#232B3E' } },
  { hour: 23, colors: { primary: '#4A5568', secondary: '#34495E', tertiary: '#232B3E' } },
];

// Interface pour les props du composant
interface DynamicBackgroundProps {
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const { getCurrentTime } = useTime();
  const backgroundRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const zoomTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const lastUpdateRef = useRef<string>('');
  const animationFrameRef = useRef<number | null>(null);
  const [landscapeBrightness, setLandscapeBrightness] = useState(1);

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

  // Fonction pour calculer la luminosité du paysage selon l'heure - VERSION AMÉLIORÉE
  const calculateLandscapeBrightness = (preciseHour: number): number => {
    // Luminosité maximale pendant la journée (7h-17h)
    if (preciseHour >= 7 && preciseHour <= 17) {
      return 1.0; // Pleine luminosité
    }

    // Transition douce au lever du soleil (5h-7h) - Aube progressive
    if (preciseHour >= 5 && preciseHour < 7) {
      const progress = (preciseHour - 5) / 2;
      return 0.25 + (0.75 * progress); // De 25% à 100% (plus sombre au début)
    }

    // Début de soirée (17h-18h) - Légère diminution avant le coucher
    if (preciseHour > 17 && preciseHour <= 18) {
      const progress = (preciseHour - 17);
      return 1.0 - (0.15 * progress); // De 100% à 85% (légère baisse)
    }

    // COUCHER DE SOLEIL (18h-19h) - Transition dramatique avec couleurs chaudes
    if (preciseHour > 18 && preciseHour <= 19) {
      const progress = (preciseHour - 18);
      return 0.85 - (0.35 * progress); // De 85% à 50% (assombrissement progressif)
    }

    // FIN DE COUCHER (19h-20h) - Transition vers la nuit
    if (preciseHour > 19 && preciseHour <= 20) {
      const progress = (preciseHour - 19);
      return 0.5 - (0.25 * progress); // De 50% à 25% (plus sombre)
    }

    // Crépuscule tardif (20h-21h) - Dernières lueurs
    if (preciseHour > 20 && preciseHour <= 21) {
      const progress = (preciseHour - 20);
      return 0.25 - (0.05 * progress); // De 25% à 20% (très sombre)
    }

    // Nuit profonde (21h-5h) - Paysage très sombre
    return 0.2; // 20% de luminosité pour la nuit (plus sombre qu'avant)
  };

  // Fonction pour obtenir les couleurs actuelles basées sur l'heure avec transitions ultra-fluides
  const getCurrentColors = () => {
    const now = getCurrentTime(); // Utiliser le temps du contexte (réel ou simulé)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Calcul du facteur de progression dans l'heure (0-1) avec précision en secondes
    const hourProgress = (currentMinute * 60 + currentSecond) / 3600;

    // Trouver les couleurs de l'heure actuelle et de la suivante
    const currentTimeColor = TIME_COLORS.find(tc => tc.hour === currentHour) || TIME_COLORS[0];
    const nextHour = (currentHour + 1) % 24;
    const nextTimeColor = TIME_COLORS.find(tc => tc.hour === nextHour) || TIME_COLORS[0];

    // Interpolation ultra-fluide avec courbe d'easing intégrée
    const primary = interpolateColor(currentTimeColor.colors.primary, nextTimeColor.colors.primary, hourProgress);
    const secondary = interpolateColor(currentTimeColor.colors.secondary, nextTimeColor.colors.secondary, hourProgress);
    const tertiary = interpolateColor(currentTimeColor.colors.tertiary, nextTimeColor.colors.tertiary, hourProgress);

    return { primary, secondary, tertiary };
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
    const newBrightness = calculateLandscapeBrightness(preciseHour);

    // 🔍 DEBUG: Log pour comprendre le problème du background
    console.log(`🎨 BACKGROUND: ${preciseHour.toFixed(2)}h | Luminosité: ${newBrightness.toFixed(2)} | Couleurs: ${colors.primary}, ${colors.secondary}, ${colors.tertiary}`);

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
  }, []);



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
