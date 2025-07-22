import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface FixedStarsProps {
  skyMode: string;
  density?: 'low' | 'medium' | 'high'; // Densité des étoiles
}

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  type: 'ultra-micro' | 'micro' | 'small' | 'medium' | 'large';
}

const FixedStars: React.FC<FixedStarsProps> = ({ skyMode, density = 'high' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);
  const animationsRef = useRef<gsap.core.Timeline[]>([]);

  // Configuration selon la densité demandée - AVEC ULTRA-MICRO ÉTOILES
  const getDensityConfig = (skyMode: string) => {
    const isDeepNight = skyMode === 'night';

    if (isDeepNight) {
      // NUIT PROFONDE : CISCO - BEAUCOUP plus de micro-étoiles comme demandé !
      return {
        low: { 'ultra-micro': 300, micro: 200, small: 40, medium: 15, large: 5 },
        medium: { 'ultra-micro': 600, micro: 400, small: 80, medium: 25, large: 8 },
        high: { 'ultra-micro': 1000, micro: 600, small: 120, medium: 35, large: 12 } // CISCO: Vraiment beaucoup !
      };
    } else {
      // AUTRES MODES : Configuration normale sans ultra-micro
      return {
        low: { 'ultra-micro': 0, micro: 50, small: 20, medium: 8, large: 3 },
        medium: { 'ultra-micro': 0, micro: 120, small: 40, medium: 15, large: 5 },
        high: { 'ultra-micro': 0, micro: 250, small: 80, medium: 25, large: 8 }
      };
    }
  };

  // Visibilité selon le mode du ciel
  const getVisibility = (skyMode: string): number => {
    switch (skyMode) {
      case 'night': return 1.0;
      case 'dusk': return 0.8;
      case 'sunset': return 0.6;
      case 'dawn': return 0.4;
      case 'evening': return 0.7;
      default: return 0.1; // Presque invisibles en journée
    }
  };

  // Génération d'une étoile selon son type
  const generateStar = (type: Star['type'], id: number): Star => {
    const configs = {
      'ultra-micro': {
        sizeRange: [0.4, 0.8], // CISCO: Plus visibles (était 0.1-0.3)
        brightnessRange: [0.3, 0.6], // CISCO: Plus lumineuses (était 0.1-0.3)
        twinkleSpeedRange: [0.5, 1.5]
      },
      micro: {
        sizeRange: [0.8, 1.2], // CISCO: Légèrement plus grosses (était 0.3-0.8)
        brightnessRange: [0.4, 0.7], // CISCO: Plus lumineuses (était 0.2-0.5)
        twinkleSpeedRange: [0.8, 2.0]
      },
      small: {
        sizeRange: [0.8, 1.5],
        brightnessRange: [0.3, 0.7],
        twinkleSpeedRange: [1.0, 2.5]
      },
      medium: {
        sizeRange: [1.5, 2.8],
        brightnessRange: [0.5, 0.8],
        twinkleSpeedRange: [1.2, 3.0]
      },
      large: {
        sizeRange: [2.8, 4.5],
        brightnessRange: [0.7, 1.0],
        twinkleSpeedRange: [1.5, 3.5]
      }
    };

    const config = configs[type];
    
    return {
      id,
      x: Math.random() * 100, // Position en pourcentage sur toute la largeur
      y: Math.random() * 25, // CISCO: Concentré dans le quart supérieur (0-25%) pour maximum de densité !
      size: config.sizeRange[0] + Math.random() * (config.sizeRange[1] - config.sizeRange[0]),
      brightness: config.brightnessRange[0] + Math.random() * (config.brightnessRange[1] - config.brightnessRange[0]),
      twinkleSpeed: config.twinkleSpeedRange[0] + Math.random() * (config.twinkleSpeedRange[1] - config.twinkleSpeedRange[0]),
      type
    };
  };

  // Création de toutes les étoiles
  const createStars = () => {
    const stars: Star[] = [];
    const config = getDensityConfig(skyMode)[density];
    let id = 0;

    // Créer les étoiles de chaque type
    Object.entries(config).forEach(([type, count]) => {
      for (let i = 0; i < (count as number); i++) {
        stars.push(generateStar(type as Star['type'], id++));
      }
    });

    return stars;
  };

  // Rendu d'une étoile dans le DOM
  const renderStar = (star: Star) => {
    if (!containerRef.current) return;

    const element = document.createElement('div');
    element.className = `fixed-star fixed-star-${star.type}`;
    element.id = `star-${star.id}`;
    
    // Couleurs selon le type d'étoile
    const getStarColor = (type: Star['type'], brightness: number) => {
      const colors = {
        'ultra-micro': `rgba(255, 255, 255, ${brightness * 0.4})`, // Très subtiles
        micro: `rgba(255, 255, 255, ${brightness * 0.6})`,
        small: `rgba(255, 248, 220, ${brightness * 0.8})`,
        medium: `rgba(173, 216, 230, ${brightness * 0.9})`,
        large: `rgba(255, 255, 240, ${brightness})`
      };
      return colors[type];
    };

    element.style.cssText = `
      position: absolute;
      left: ${star.x}%;
      top: ${star.y}%;
      width: ${star.size}px;
      height: ${star.size}px;
      background: ${getStarColor(star.type, star.brightness)};
      border-radius: 50%;
      pointer-events: none;
      z-index: 15;
      box-shadow: 0 0 ${star.size * 1.5}px ${getStarColor(star.type, star.brightness * 0.6)};
      transition: opacity 0.3s ease;
    `;

    containerRef.current.appendChild(element);

    // Animation de scintillement améliorée - CISCO: Plus réaliste pour les grosses étoiles
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });

    // Scintillement plus prononcé pour les grosses étoiles
    const minOpacity = star.type === 'large' ? star.brightness * 0.4 : star.brightness * 0.3;
    const scaleVariation = star.type === 'large' ? 0.8 : (star.type === 'medium' ? 0.75 : 0.7);

    timeline.to(element, {
      opacity: minOpacity,
      scale: scaleVariation,
      duration: star.twinkleSpeed,
      ease: "power2.inOut"
    });

    // Ajouter un effet de "pulse" pour les grosses étoiles
    if (star.type === 'large' || star.type === 'medium') {
      timeline.to(element, {
        boxShadow: `0 0 ${star.size * 3}px ${getStarColor(star.type, star.brightness)}`,
        duration: star.twinkleSpeed * 0.5,
        ease: "power1.inOut"
      }, 0);
    }

    animationsRef.current.push(timeline);

    return element;
  };

  // Initialisation des étoiles
  const initializeStars = () => {
    if (!containerRef.current) return;

    // Nettoyer les anciennes étoiles
    cleanupStars();

    // Créer les nouvelles étoiles
    starsRef.current = createStars();
    
    // Rendre chaque étoile
    starsRef.current.forEach(star => {
      renderStar(star);
    });

    console.log(`✨ ${starsRef.current.length} étoiles fixes créées (${density})`);
  };

  // Nettoyage des étoiles
  const cleanupStars = () => {
    // Stopper toutes les animations
    animationsRef.current.forEach(timeline => timeline.kill());
    animationsRef.current = [];

    // Supprimer tous les éléments étoiles
    if (containerRef.current) {
      const starElements = containerRef.current.querySelectorAll('.fixed-star');
      starElements.forEach(element => element.remove());
    }

    starsRef.current = [];
  };

  // Mise à jour de la visibilité selon le mode du ciel avec transition progressive
  const updateVisibility = (duration: number = 8.0) => {
    if (!containerRef.current) return;

    const visibility = getVisibility(skyMode);
    const starElements = containerRef.current.querySelectorAll('.fixed-star');

    console.log(`⭐ Transition progressive des étoiles vers opacité ${visibility} (durée: ${duration}s)`);

    starElements.forEach((element: Element) => {
      // Utiliser GSAP pour une transition douce synchronisée avec le background
      gsap.to(element as HTMLElement, {
        opacity: visibility,
        duration: duration,
        ease: "power1.inOut", // Même easing que le background
        overwrite: true // Éviter les conflits de transition
      });
    });
  };

  // Initialisation au montage et quand le mode change (pour les ultra-micro en nuit)
  useEffect(() => {
    initializeStars();
    return cleanupStars;
  }, [density, skyMode]); // Régénérer quand skyMode change pour les ultra-micro

  // Mise à jour de la visibilité quand le mode change avec transition progressive
  useEffect(() => {
    // Utiliser la même durée que les transitions du background (8 secondes)
    updateVisibility(8.0);
  }, [skyMode]);

  return (
    <div
      ref={containerRef}
      className="fixed absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 20 }} // CISCO: Z-index élevé pour être au-dessus du paysage
    />
  );
};

export default FixedStars;
