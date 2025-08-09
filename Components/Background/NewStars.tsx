import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface NewStarsProps {
  skyMode: string;
  density?: 'low' | 'medium' | 'high';
}

interface SimpleStar {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  color: string;
}

const NewStars: React.FC<NewStarsProps> = ({ skyMode, density = 'high' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<SimpleStar[]>([]);

  // 🌟 CISCO: Configuration améliorée - Moins de grosses, plus de micro-étoiles
  const getStarConfig = (density: string, skyMode: string) => {
    if (skyMode !== 'night') return { big: 0, micro: 0 };

    switch (density) {
      case 'low':
        return { big: 8, micro: 60 }; // 8 grosses + 60 micro = 68 total
      case 'medium':
        return { big: 15, micro: 120 }; // 15 grosses + 120 micro = 135 total
      case 'high':
        return { big: 20, micro: 200 }; // 20 grosses + 200 micro = 220 total
      default:
        return { big: 15, micro: 120 };
    }
  };

  // 🌟 CISCO: Génération d'étoiles différenciées (grosses vs micro)
  const createBigStar = (id: number): SimpleStar => {
    // Grosses étoiles : plus visibles, scintillement lent
    const sizeOptions = [3.0, 3.5, 4.0, 4.5]; // Grosses tailles
    const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];

    const opacityOptions = [0.7, 0.8, 0.9, 1.0]; // Bien visibles
    const opacity = opacityOptions[Math.floor(Math.random() * opacityOptions.length)];

    const colors = [
      'rgba(255, 255, 255, 1)', // Blanc pur
      'rgba(255, 255, 240, 1)', // Blanc chaud
      'rgba(255, 250, 205, 1)', // Blanc doré
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      id,
      x: Math.random() * 100,
      y: Math.random() * 60,
      size,
      opacity,
      color
    };
  };

  const createMicroStar = (id: number): SimpleStar => {
    // Micro-étoiles : plus petites, scintillement rapide
    const sizeOptions = [0.8, 1.0, 1.2, 1.5]; // Micro tailles
    const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];

    const opacityOptions = [0.3, 0.4, 0.5, 0.6]; // Plus subtiles
    const opacity = opacityOptions[Math.floor(Math.random() * opacityOptions.length)];

    const colors = [
      'rgba(255, 255, 255, 0.8)', // Blanc subtil
      'rgba(240, 248, 255, 0.8)', // Blanc froid
      'rgba(230, 230, 250, 0.8)'  // Blanc lavande
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      id,
      x: Math.random() * 100,
      y: Math.random() * 70, // Micro-étoiles peuvent aller plus bas
      size,
      opacity,
      color
    };
  };

  // 🌟 CISCO: Rendu amélioré avec différenciation grosses/micro étoiles
  const renderStars = () => {
    if (!containerRef.current) return;

    // Nettoyer les anciennes étoiles
    containerRef.current.innerHTML = '';

    const starConfig = getStarConfig(density, skyMode);
    const totalStars = starConfig.big + starConfig.micro;
    console.log(`🌟 Création de ${totalStars} étoiles (${starConfig.big} grosses + ${starConfig.micro} micro) pour mode ${skyMode}`);

    if (totalStars === 0) {
      starsRef.current = [];
      return;
    }

    // Créer les étoiles différenciées
    const stars: SimpleStar[] = [];
    let id = 0;

    // Créer les grosses étoiles
    for (let i = 0; i < starConfig.big; i++) {
      stars.push(createBigStar(id++));
    }

    // Créer les micro-étoiles
    for (let i = 0; i < starConfig.micro; i++) {
      stars.push(createMicroStar(id++));
    }

    starsRef.current = stars;

    // Rendre chaque étoile dans le DOM avec scintillement différencié
    stars.forEach((star, index) => {
      const element = document.createElement('div');
      const isBigStar = index < starConfig.big;
      element.className = isBigStar ? 'new-star big-star' : 'new-star micro-star';
      element.id = `new-star-${star.id}`;

      // Scintillement différencié selon le type
      const twinkleDuration = isBigStar
        ? 3 + Math.random() * 4  // Grosses étoiles : 3-7s (lent)
        : 1 + Math.random() * 2; // Micro-étoiles : 1-3s (rapide)

      const twinkleDelay = Math.random() * 2; // Délai aléatoire pour désynchroniser

      element.style.cssText = `
        position: absolute;
        left: ${star.x}%;
        top: ${star.y}%;
        width: ${star.size}px;
        height: ${star.size}px;
        background: ${star.color};
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        opacity: ${star.opacity};
        box-shadow: 0 0 ${star.size * (isBigStar ? 3 : 1.5)}px ${star.color};
        animation: ${isBigStar ? 'twinkle-big' : 'twinkle-micro'} ${twinkleDuration}s ease-in-out infinite alternate;
        animation-delay: ${twinkleDelay}s;
      `;

      containerRef.current!.appendChild(element);
    });

    // Ajouter l'animation CSS de scintillement
    if (!document.getElementById('new-stars-animation')) {
      const style = document.createElement('style');
      style.id = 'new-stars-animation';
      style.textContent = `
        @keyframes twinkle-simple {
          0% { 
            opacity: 0.3; 
            transform: scale(0.8); 
          }
          100% { 
            opacity: 1.0; 
            transform: scale(1.2); 
          }
        }
      `;
      document.head.appendChild(style);
    }

    console.log(`✅ ${starCount} étoiles créées et rendues avec z-index 9999`);
  };

  // 🌟 CISCO: Réagir aux changements de mode
  useEffect(() => {
    console.log(`🌟 NewStars: Mode changé vers ${skyMode}`);
    renderStars();
  }, [skyMode, density]);

  // 🌟 CISCO: Nettoyage au démontage
  useEffect(() => {
    return () => {
      const style = document.getElementById('new-stars-animation');
      if (style) {
        style.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed absolute inset-0 overflow-hidden pointer-events-none"
      style={{ 
        zIndex: 9999, // 🔧 CISCO: Z-index très élevé pour garantir la visibilité
        background: 'transparent'
      }}
    />
  );
};

export default NewStars;
