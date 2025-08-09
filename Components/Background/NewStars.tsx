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

  // 🌟 CISCO: Configuration simple et efficace
  const getStarCount = (density: string, skyMode: string): number => {
    if (skyMode !== 'night') return 0; // Étoiles seulement en mode nuit
    
    switch (density) {
      case 'low': return 50;
      case 'medium': return 100;
      case 'high': return 200; // Nombre raisonnable et visible
      default: return 100;
    }
  };

  // 🌟 CISCO: Génération d'étoile simple et visible
  const createStar = (id: number): SimpleStar => {
    // Tailles visibles garanties
    const sizeOptions = [1.5, 2.0, 2.5, 3.0, 3.5, 4.0]; // Tailles fixes visibles
    const size = sizeOptions[Math.floor(Math.random() * sizeOptions.length)];
    
    // Opacités visibles garanties
    const opacityOptions = [0.6, 0.7, 0.8, 0.9, 1.0]; // Opacités fixes visibles
    const opacity = opacityOptions[Math.floor(Math.random() * opacityOptions.length)];
    
    // Couleurs variées mais visibles
    const colors = [
      'rgba(255, 255, 255, 1)', // Blanc pur
      'rgba(255, 255, 240, 1)', // Blanc chaud
      'rgba(240, 248, 255, 1)', // Blanc froid
      'rgba(255, 250, 205, 1)', // Blanc doré
      'rgba(230, 230, 250, 1)'  // Blanc lavande
    ];
    const color = colors[Math.floor(Math.random() * colors.length)];

    return {
      id,
      x: Math.random() * 100, // Position X sur toute la largeur
      y: Math.random() * 60,  // Position Y sur 60% du haut (éviter le paysage)
      size,
      opacity,
      color
    };
  };

  // 🌟 CISCO: Rendu simple et direct dans le DOM
  const renderStars = () => {
    if (!containerRef.current) return;

    // Nettoyer les anciennes étoiles
    containerRef.current.innerHTML = '';

    const starCount = getStarCount(density, skyMode);
    console.log(`🌟 Création de ${starCount} nouvelles étoiles pour mode ${skyMode}`);

    if (starCount === 0) {
      starsRef.current = [];
      return;
    }

    // Créer les étoiles
    const stars: SimpleStar[] = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(createStar(i));
    }
    starsRef.current = stars;

    // Rendre chaque étoile dans le DOM
    stars.forEach(star => {
      const element = document.createElement('div');
      element.className = 'new-star';
      element.id = `new-star-${star.id}`;
      
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
        box-shadow: 0 0 ${star.size * 2}px ${star.color};
        animation: twinkle-simple ${2 + Math.random() * 3}s ease-in-out infinite alternate;
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
