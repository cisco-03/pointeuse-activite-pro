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
  const isMountedRef = useRef(true); // 🔧 CISCO: Vérification montage composant
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null); // 🔧 CISCO: Debouncing
  const starsInitializedRef = useRef(false); // 🔧 CISCO: Éviter double initialisation

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

  // 🌟 CISCO: Initialisation optimisée - Créer les étoiles UNE SEULE FOIS
  const initializeStars = () => {
    if (!containerRef.current || !isMountedRef.current || starsInitializedRef.current) return;

    console.log(`🌟 INITIALISATION UNIQUE des étoiles pour densité ${density}`);

    // Nettoyer les anciennes étoiles si elles existent
    containerRef.current.innerHTML = '';

    const starConfig = getStarConfig(density, 'night'); // Toujours créer pour le mode nuit
    const totalStars = starConfig.big + starConfig.micro;

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
    starsInitializedRef.current = true;

    // Ajouter les animations CSS une seule fois
    addStarAnimations();

    // Rendu progressif par batches pour éviter le blocage UI
    renderStarsProgressively(stars, starConfig);
  };

  // 🔧 CISCO: Ajout des animations CSS (une seule fois)
  const addStarAnimations = () => {
    if (document.getElementById('new-stars-animation')) return; // Déjà ajoutées

    const style = document.createElement('style');
    style.id = 'new-stars-animation';
    style.textContent = `
      @keyframes twinkle-big {
        0% {
          opacity: 0.4;
          transform: scale(0.9);
          filter: brightness(0.8);
        }
        50% {
          opacity: 0.8;
          transform: scale(1.0);
          filter: brightness(1.0);
        }
        100% {
          opacity: 1.0;
          transform: scale(1.1);
          filter: brightness(1.2);
        }
      }

      @keyframes twinkle-micro {
        0% {
          opacity: 0.1;
          transform: scale(0.6);
          filter: brightness(0.6);
        }
        25% {
          opacity: 0.3;
          transform: scale(0.8);
          filter: brightness(0.8);
        }
        75% {
          opacity: 0.6;
          transform: scale(1.0);
          filter: brightness(1.0);
        }
        100% {
          opacity: 0.8;
          transform: scale(1.2);
          filter: brightness(1.3);
        }
      }
    `;
    document.head.appendChild(style);
  };

  // 🚀 CISCO: Rendu progressif par batches (évite blocage UI)
  const renderStarsProgressively = (stars: SimpleStar[], starConfig: { big: number; micro: number }) => {
    if (!containerRef.current || !isMountedRef.current) return;

    const BATCH_SIZE = 20; // Créer 20 étoiles par batch
    let currentIndex = 0;

    const renderBatch = () => {
      if (!containerRef.current || !isMountedRef.current) return;

      const endIndex = Math.min(currentIndex + BATCH_SIZE, stars.length);

      for (let i = currentIndex; i < endIndex; i++) {
        const star = stars[i];
        const element = document.createElement('div');
        const isBigStar = i < starConfig.big;

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
          opacity: ${skyMode === 'night' ? star.opacity : 0};
          box-shadow: 0 0 ${star.size * (isBigStar ? 3 : 1.5)}px ${star.color};
          animation: ${isBigStar ? 'twinkle-big' : 'twinkle-micro'} ${twinkleDuration}s ease-in-out infinite alternate;
          animation-delay: ${twinkleDelay}s;
          transition: opacity 0.5s ease;
        `;

        containerRef.current.appendChild(element);
      }

      currentIndex = endIndex;

      // Continuer avec le prochain batch si nécessaire
      if (currentIndex < stars.length && isMountedRef.current) {
        requestAnimationFrame(renderBatch);
      } else {
        console.log(`✅ ${stars.length} étoiles créées progressivement (${starConfig.big} grosses + ${starConfig.micro} micro)`);
      }
    };

    // Démarrer le rendu progressif
    requestAnimationFrame(renderBatch);
  };

  // 🔧 CISCO: Contrôle de visibilité optimisé (sans recréation)
  const updateStarsVisibility = (targetSkyMode: string) => {
    if (!containerRef.current || !isMountedRef.current) return;

    const starElements = containerRef.current.querySelectorAll('.new-star');
    const shouldBeVisible = targetSkyMode === 'night';

    console.log(`🌟 Mise à jour visibilité ${starElements.length} étoiles pour mode ${targetSkyMode}: ${shouldBeVisible ? 'VISIBLE' : 'MASQUÉ'}`);

    starElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      const starId = parseInt(htmlElement.id.replace('new-star-', ''));
      const star = starsRef.current.find(s => s.id === starId);

      if (star) {
        // Transition douce de visibilité
        htmlElement.style.opacity = shouldBeVisible ? star.opacity.toString() : '0';
      }
    });
  };

  // 🔧 CISCO: Debouncing pour éviter les appels multiples rapides
  const debouncedUpdateVisibility = (targetSkyMode: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        updateStarsVisibility(targetSkyMode);
      }
    }, 100); // Délai de 100ms pour debouncing
  };

  // 🌟 CISCO: Initialisation une seule fois au montage
  useEffect(() => {
    console.log(`🌟 NewStars: Initialisation pour densité ${density}`);
    initializeStars();

    return () => {
      // Nettoyage au démontage
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [density]); // Seulement quand la densité change

  // 🌟 CISCO: Réagir aux changements de mode (optimisé)
  useEffect(() => {
    console.log(`🌟 NewStars: Mode changé vers ${skyMode}`);

    if (starsInitializedRef.current) {
      // Étoiles déjà créées, juste changer la visibilité
      debouncedUpdateVisibility(skyMode);
    } else {
      // Première fois, initialiser si nécessaire
      if (skyMode === 'night') {
        initializeStars();
      }
    }
  }, [skyMode]); // Seulement skyMode, pas density

  // 🌟 CISCO: Nettoyage complet au démontage
  useEffect(() => {
    return () => {
      console.log('🧹 NewStars: Nettoyage au démontage');

      // Marquer comme démonté
      isMountedRef.current = false;

      // Nettoyer le timer de debouncing
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      // Nettoyer les animations CSS
      const style = document.getElementById('new-stars-animation');
      if (style) {
        style.remove();
      }

      // Réinitialiser les flags
      starsInitializedRef.current = false;
      starsRef.current = [];
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
