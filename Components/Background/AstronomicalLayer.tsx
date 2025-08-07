import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import FixedStars from './FixedStars';
import ShootingStars from './ShootingStars';

// Interface pour une étoile
interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  brightness: number;
  twinkleDelay: number;
}

// Interface pour les props du composant
interface AstronomicalLayerProps {
  // Mode du ciel pour contrôler la visibilité des étoiles
  skyMode?: 'night' | 'dawn' | 'sunrise' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'dusk';
}

const AstronomicalLayer: React.FC<AstronomicalLayerProps> = ({ skyMode = 'night' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);
  const starsContainerRef = useRef<HTMLDivElement | null>(null);





  // Générer les étoiles une seule fois
  const generateStars = (): Star[] => {
    const stars: Star[] = [];
    const starCount = 150; // 🔧 MODE MANUEL: Nombre réduit d'étoiles

    for (let i = 0; i < starCount; i++) {
      stars.push({
        id: i,
        x: Math.random() * 100, // Pourcentage
        y: Math.random() * 85, // Étendre jusqu'à 85% pour réduire le trou en bas
        size: Math.random() * 2 + 1, // 1px à 3px
        brightness: Math.random() * 0.7 + 0.3, // 0.3 à 1.0
        twinkleDelay: Math.random() * 3, // Délai aléatoire pour le scintillement
      });
    }

    return stars;
  };

  // 🔧 NOUVEAU: Fonction pour déterminer la visibilité des étoiles selon le mode
  const getStarsVisibility = (mode: string): { visible: boolean; opacity: number } => {
    switch (mode) {
      case 'night':
        return { visible: true, opacity: 1.0 }; // 100% visible la nuit
      case 'dusk':
        return { visible: true, opacity: 0.8 }; // 80% visible au crépuscule
      case 'dawn':
        return { visible: true, opacity: 0.4 }; // 40% visible à l'aube (quelques étoiles restantes)
      case 'sunrise':
        return { visible: true, opacity: 0.1 }; // 10% visible au lever du soleil (presque disparu)
      case 'morning':
      case 'midday':
      case 'afternoon':
      case 'sunset':
        return { visible: false, opacity: 0.0 }; // Invisibles pendant la journée
      default:
        return { visible: true, opacity: 1.0 };
    }
  };

  // 🔧 FONCTION: Mettre à jour la visibilité des étoiles
  const updateStarsVisibility = (mode: string, duration: number = 15.0) => {
    if (!starsContainerRef.current) return;

    const { visible, opacity } = getStarsVisibility(mode);
    
    console.log(`⭐ Transition progressive des étoiles pour mode ${mode}: visible=${visible}, opacity=${opacity}`);

    if (visible) {
      starsContainerRef.current.style.display = 'block';
    }

    gsap.to(starsContainerRef.current, {
        opacity: opacity,
        duration: duration,
        ease: "power1.inOut",
        onComplete: () => {
            if (!visible && starsContainerRef.current) {
                starsContainerRef.current.style.display = 'none';
            }
        }
    });
  };

  // 🔧 MODE MANUEL: Initialisation simplifiée
  useEffect(() => {
    if (!containerRef.current) return;

    // Générer les étoiles
    const stars = generateStars();
    starsRef.current = stars;

    // Nettoyer le conteneur
    containerRef.current.innerHTML = '';

    // Créer le conteneur des étoiles
    const starsContainer = document.createElement('div');
    starsContainer.style.cssText = `
      position: absolute;
      inset: 0;
      pointer-events: none;
      z-index: 1;
      transition: opacity 2s ease-in-out;
    `;
    starsContainerRef.current = starsContainer;
    containerRef.current.appendChild(starsContainer);

    // Créer les éléments d'étoiles
    stars.forEach((star) => {
      const starElement = document.createElement('div');
      starElement.className = 'star';
      starElement.style.cssText = `
        position: absolute;
        left: ${star.x}%;
        top: ${star.y}%;
        width: ${star.size}px;
        height: ${star.size}px;
        background: white;
        border-radius: 50%;
        opacity: ${star.brightness};
        box-shadow: 0 0 ${star.size * 2}px rgba(255, 255, 255, 0.6);
        animation: twinkle ${2 + Math.random() * 3}s infinite ${star.twinkleDelay}s;
      `;
      starsContainer.appendChild(starElement);
    });

    // Animation de scintillement
    if (!document.querySelector('#star-animation-style')) {
      const style = document.createElement('style');
      style.id = 'star-animation-style';
      style.textContent = `
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .star {
          will-change: opacity, transform;
        }
      `;
      document.head.appendChild(style);
    }

    // Mettre à jour la visibilité initiale
    updateStarsVisibility(skyMode);

    return () => {
      const style = document.querySelector('#star-animation-style');
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // 🔧 NOUVEAU: Réagir aux changements de mode
  useEffect(() => {
    const transitionDuration = 15.0;
    updateStarsVisibility(skyMode, transitionDuration);
  }, [skyMode]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 1
      }}
    >
      {/* Étoiles fixes avec haute densité */}
      <FixedStars skyMode={skyMode} density="high" />
      
      {/* Étoiles filantes */}
      <ShootingStars skyMode={skyMode} />
    </div>
  );
};

export default AstronomicalLayer;
