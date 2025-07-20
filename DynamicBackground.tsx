import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import AstronomicalLayer from './AstronomicalLayer';

// Types pour les couleurs du cycle jour/nuit
interface TimeColor {
  hour: number;
  colors: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
}

// Palette de couleurs pour chaque moment de la journée
// Format: { primary: bas (horizon), secondary: milieu, tertiary: haut (ciel) }
const TIME_COLORS: TimeColor[] = [
  // Nuit profonde (0h-4h) - Très sombre
  { hour: 0, colors: { primary: '#1a1a2e', secondary: '#16213e', tertiary: '#0f0f23' } },
  { hour: 1, colors: { primary: '#1a1a2e', secondary: '#16213e', tertiary: '#0f0f23' } },
  { hour: 2, colors: { primary: '#1a1a2e', secondary: '#16213e', tertiary: '#0f0f23' } },
  { hour: 3, colors: { primary: '#1a1a2e', secondary: '#16213e', tertiary: '#0f0f23' } },
  { hour: 4, colors: { primary: '#1a1a2e', secondary: '#16213e', tertiary: '#0f0f23' } },

  // Aube (5h-7h) - Palettes Gemini 🌅
  { hour: 5, colors: { primary: '#2d1b69', secondary: '#1a1a3a', tertiary: '#0f0f23' } },
  { hour: 6, colors: { primary: '#FFDDA1', secondary: '#FBC7D4', tertiary: '#A8D8EA' } },
  { hour: 7, colors: { primary: '#FFDDA1', secondary: '#FBC7D4', tertiary: '#A8D8EA' } },

  // Matin (8h-11h) - Transition vers le jour
  { hour: 8, colors: { primary: '#A8D8EA', secondary: '#87CEEB', tertiary: '#87CEEB' } },
  { hour: 9, colors: { primary: '#87CEEB', secondary: '#87CEEB', tertiary: '#1E90FF' } },
  { hour: 10, colors: { primary: '#87CEEB', secondary: '#1E90FF', tertiary: '#1E90FF' } },
  { hour: 11, colors: { primary: '#87CEEB', secondary: '#1E90FF', tertiary: '#1E90FF' } },

  // Midi (12h-14h) - Palettes Gemini ☀️
  { hour: 12, colors: { primary: '#87CEEB', secondary: '#1E90FF', tertiary: '#1E90FF' } },
  { hour: 13, colors: { primary: '#87CEEB', secondary: '#1E90FF', tertiary: '#1E90FF' } },
  { hour: 14, colors: { primary: '#87CEEB', secondary: '#1E90FF', tertiary: '#1E90FF' } },

  // Après-midi (15h-17h) - Transition vers le chaud
  { hour: 15, colors: { primary: '#81d4fa', secondary: '#29b6f6', tertiary: '#0277bd' } },
  { hour: 16, colors: { primary: '#ffcc80', secondary: '#4fc3f7', tertiary: '#0288d1' } },
  { hour: 17, colors: { primary: '#ffab91', secondary: '#81d4fa', tertiary: '#29b6f6' } },

  // Crépuscule (18h-20h) - Palettes Gemini 🌆
  { hour: 18, colors: { primary: '#FF8C00', secondary: '#8A2BE2', tertiary: '#191970' } },
  { hour: 19, colors: { primary: '#FF8C00', secondary: '#8A2BE2', tertiary: '#191970' } },
  { hour: 20, colors: { primary: '#FF8C00', secondary: '#8A2BE2', tertiary: '#191970' } },

  // Soirée (21h-23h) - Transition vers la nuit
  { hour: 21, colors: { primary: '#8A2BE2', secondary: '#191970', tertiary: '#0f0f23' } },
  { hour: 22, colors: { primary: '#191970', secondary: '#0f0f23', tertiary: '#0f0f23' } },
  { hour: 23, colors: { primary: '#191970', secondary: '#0f0f23', tertiary: '#0f0f23' } },
];

// Interface pour les props du composant
interface DynamicBackgroundProps {
  children: React.ReactNode;
}

const DynamicBackground: React.FC<DynamicBackgroundProps> = ({ children }) => {
  const backgroundRef = useRef<HTMLDivElement>(null);
  const landscapeRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const lastUpdateRef = useRef<string>('');
  const animationFrameRef = useRef<number | null>(null);
  const [landscapeBrightness, setLandscapeBrightness] = useState(1);

  // Fonction pour interpoler entre deux couleurs
  const interpolateColor = (color1: string, color2: string, factor: number): string => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Fonction pour calculer la luminosité du paysage selon l'heure
  const calculateLandscapeBrightness = (hour: number): number => {
    // Luminosité maximale pendant la journée (6h-18h)
    if (hour >= 6 && hour <= 18) {
      return 1.0; // Pleine luminosité
    }

    // Transition douce au lever du soleil (5h-7h)
    if (hour >= 5 && hour < 6) {
      const progress = (hour - 5);
      return 0.3 + (0.7 * progress); // De 30% à 100%
    }

    // Transition douce au coucher du soleil (18h-20h)
    if (hour > 18 && hour <= 20) {
      const progress = (hour - 18) / 2;
      return 1.0 - (0.7 * progress); // De 100% à 30%
    }

    // Nuit profonde (20h-5h) - image assombrie
    return 0.3; // 30% de luminosité pour la nuit
  };

  // Fonction pour obtenir les couleurs actuelles basées sur l'heure
  const getCurrentColors = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Calcul du facteur de progression dans l'heure (0-1)
    const hourProgress = (currentMinute * 60 + currentSecond) / 3600;
    
    // Trouver les couleurs de l'heure actuelle et de la suivante
    const currentTimeColor = TIME_COLORS.find(tc => tc.hour === currentHour) || TIME_COLORS[0];
    const nextHour = (currentHour + 1) % 24;
    const nextTimeColor = TIME_COLORS.find(tc => tc.hour === nextHour) || TIME_COLORS[0];
    
    // Interpoler entre les couleurs actuelles et suivantes
    const primary = interpolateColor(currentTimeColor.colors.primary, nextTimeColor.colors.primary, hourProgress);
    const secondary = interpolateColor(currentTimeColor.colors.secondary, nextTimeColor.colors.secondary, hourProgress);
    const tertiary = interpolateColor(currentTimeColor.colors.tertiary, nextTimeColor.colors.tertiary, hourProgress);
    
    return { primary, secondary, tertiary };
  };

  // Fonction pour mettre à jour l'arrière-plan avec optimisations
  const updateBackground = () => {
    if (!backgroundRef.current) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Calcul précis de l'heure avec minutes et secondes
    const preciseHour = currentHour + currentMinute / 60 + currentSecond / 3600;

    const colors = getCurrentColors();
    const gradient = `linear-gradient(to top, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.tertiary} 100%)`;

    // Calculer la nouvelle luminosité du paysage
    const newBrightness = calculateLandscapeBrightness(preciseHour);

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

    // Animation fluide avec GSAP optimisée
    timelineRef.current = gsap.timeline();
    timelineRef.current.to(backgroundRef.current, {
      background: gradient,
      duration: 0.3,
      ease: "power1.out",
      force3D: true, // Utiliser l'accélération GPU
      willChange: "background"
    });

    // Animation de la luminosité du paysage
    if (landscapeRef.current) {
      timelineRef.current.to(landscapeRef.current, {
        filter: `brightness(${newBrightness})`,
        duration: 0.5,
        ease: "power1.out"
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

  useEffect(() => {
    // Mise à jour initiale
    updateBackground();

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
    };
  }, []);

  return (
    <div
      ref={backgroundRef}
      className="min-h-screen transition-all duration-500 ease-out relative"
      style={{
        background: 'linear-gradient(to top, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)'
      }}
    >
      <AstronomicalLayer />

      {/* Image de paysage avec effet de luminosité dynamique */}
      <div
        ref={landscapeRef}
        className="fixed inset-0 w-full h-full bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: 'url(/Background.png)',
          backgroundPosition: 'bottom center',
          backgroundSize: 'cover',
          zIndex: 5, // Devant les étoiles (z-index 1) mais derrière le contenu (z-index 10+)
          filter: `brightness(${landscapeBrightness})`,
          transition: 'filter 0.5s ease-out'
        }}
      />

      {children}
    </div>
  );
};

export default DynamicBackground;
