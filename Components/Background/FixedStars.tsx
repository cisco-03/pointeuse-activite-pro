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
  const activeStarsRef = useRef<Set<number>>(new Set()); // 🔧 CISCO: Étoiles actuellement visibles
  const rotationTimerRef = useRef<NodeJS.Timeout | null>(null); // 🔧 CISCO: Timer pour rotation

  // 🔧 CISCO: Configuration OPTIMISÉE - Rotation progressive des étoiles
  const getDensityConfig = (skyMode: string) => {
    const isDeepNight = skyMode === 'night';

    if (isDeepNight) {
      // NUIT PROFONDE : CISCO - OPTIMISÉ pour rotation progressive
      return {
        low: { 'ultra-micro': 50, micro: 30, small: 15, medium: 8, large: 3 },      // Total: 106
        medium: { 'ultra-micro': 80, micro: 50, small: 25, medium: 12, large: 5 },  // Total: 172
        high: { 'ultra-micro': 120, micro: 80, small: 40, medium: 20, large: 10 }   // Total: 270 - RÉDUIT pour performance
      };
    } else {
      // AUTRES MODES : Aucune étoile visible
      return {
        low: { 'ultra-micro': 0, micro: 0, small: 0, medium: 0, large: 0 },
        medium: { 'ultra-micro': 0, micro: 0, small: 0, medium: 0, large: 0 },
        high: { 'ultra-micro': 0, micro: 0, small: 0, medium: 0, large: 0 }
      };
    }
  };

  // 🚨 CISCO: CORRECTION URGENTE - Visibilité selon le mode du ciel
  const getVisibility = (skyMode: string): number => {
    switch (skyMode) {
      case 'night': return 1.0; // Seul mode où les étoiles sont visibles
      case 'dusk': return 0.0;   // 🚨 CISCO: INVISIBLE en crépuscule
      case 'sunset': return 0.0; // 🚨 CISCO: INVISIBLE au coucher
      case 'dawn': return 0.0;   // 🚨 CISCO: INVISIBLE à l'aube
      case 'evening': return 0.0; // 🚨 CISCO: INVISIBLE le soir
      default: return 0.0; // 🚨 CISCO: INVISIBLE en journée (matin, midi, après-midi)
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
      y: Math.random() * 70, // 🔧 CISCO: Distribution homogène sur 70% de l'écran (0-70%) pour éviter le vide en bas
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
      z-index: 7;
      box-shadow: 0 0 ${star.size * 1.5}px ${getStarColor(star.type, star.brightness * 0.6)};
      transition: opacity 0.3s ease;
    `;

    containerRef.current.appendChild(element);

    // 🔧 CISCO: ÉTOILES OPTIMISÉES - Statiques avec rotation progressive
    gsap.set(element, {
      opacity: star.brightness, // CISCO: Commencer VISIBLE avec luminosité naturelle
      scale: 1,
      boxShadow: `0 0 ${star.size * 1.5}px ${getStarColor(star.type, star.brightness * 0.6)}`
    });

    // 🌟 CISCO: ANIMATION DE SCINTILLEMENT - Timeline infinie
    const timeline = gsap.timeline({ repeat: -1, yoyo: true });

    // 🌟 CISCO: Scintillement BEAUCOUP plus prononcé et visible
    const minOpacity = star.type === 'large' ? star.brightness * 0.1 :
                      star.type === 'medium' ? star.brightness * 0.15 :
                      star.type === 'small' ? star.brightness * 0.2 :
                      star.brightness * 0.25; // Contraste MAXIMUM pour visibilité

    const maxOpacity = star.type === 'large' ? Math.min(star.brightness * 2.5, 1.0) :
                      star.type === 'medium' ? Math.min(star.brightness * 2.2, 1.0) :
                      star.type === 'small' ? Math.min(star.brightness * 2.0, 1.0) :
                      Math.min(star.brightness * 1.8, 1.0); // Luminosité MAXIMUM pour scintillement visible

    const scaleVariation = star.type === 'large' ? 0.3 :
                          star.type === 'medium' ? 0.4 :
                          star.type === 'small' ? 0.5 : 0.6; // Variation EXTRÊME pour scintillement dramatique

    const maxScale = star.type === 'large' ? 1.8 :
                    star.type === 'medium' ? 1.6 :
                    star.type === 'small' ? 1.4 : 1.2; // Échelle maximum AUGMENTÉE

    // 🌟 CISCO: Animation principale de scintillement ULTRA VISIBLE
    timeline.to(element, {
      opacity: minOpacity,
      scale: scaleVariation,
      duration: star.twinkleSpeed * 0.3, // BEAUCOUP plus rapide pour dynamisme maximum
      ease: "power2.inOut"
    });

    // 🌟 CISCO: Phase de pic lumineux DRAMATIQUE
    timeline.to(element, {
      opacity: maxOpacity,
      scale: maxScale,
      duration: star.twinkleSpeed * 0.2, // Phase très courte mais TRÈS intense
      ease: "power2.out"
    });

    // 🌟 CISCO: Effet de "pulse" lumineux INTENSIFIÉ pour toutes les étoiles
    const glowIntensity = star.type === 'large' ? star.size * 6 :
                         star.type === 'medium' ? star.size * 5 :
                         star.type === 'small' ? star.size * 4 :
                         star.size * 3.5; // Halo plus intense

    timeline.to(element, {
      boxShadow: `0 0 ${glowIntensity}px ${getStarColor(star.type, star.brightness)}, 0 0 ${glowIntensity * 2}px ${getStarColor(star.type, star.brightness * 0.8)}, 0 0 ${glowIntensity * 3}px ${getStarColor(star.type, star.brightness * 0.4)}`,
      duration: star.twinkleSpeed * 0.5,
      ease: "power1.inOut"
    }, 0); // Synchronisé avec l'opacité

    // Ajouter une variation aléatoire dans le timing pour plus de naturel
    timeline.delay(Math.random() * star.twinkleSpeed);

    animationsRef.current.push(timeline);

    return element;
  };

  // 🔧 CISCO: Initialisation des étoiles avec visibilité immédiate
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

    console.log(`✨ ${starsRef.current.length} étoiles fixes créées (${density}) pour mode ${skyMode}`);

    // 🔧 CISCO: Appliquer immédiatement la visibilité selon le mode actuel
    const initialVisibility = getVisibility(skyMode);
    const starElements = containerRef.current.querySelectorAll('.fixed-star');

    console.log(`✨ Application visibilité initiale: ${initialVisibility} pour mode ${skyMode} sur ${starElements.length} étoiles`);

    starElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;
      // 🌟 CISCO: Définir l'opacité de base ET forcer la visibilité immédiate
      htmlElement.style.setProperty('--base-opacity', initialVisibility.toString());
      htmlElement.style.opacity = initialVisibility.toString();

      // 🌟 CISCO: En mode nuit, s'assurer que les étoiles sont bien visibles
      if (skyMode === 'night') {
        console.log(`⭐ Étoile ${htmlElement.id} initialisée visible en mode nuit`);
      }
    });

    console.log(`⭐ Visibilité initiale appliquée: ${initialVisibility} pour mode ${skyMode}`);
  };

  // 🚨 CISCO: NETTOYAGE D'URGENCE - ARRÊT TOTAL des animations
  const cleanupStars = () => {
    console.log('🚨 NETTOYAGE D\'URGENCE: Arrêt de toutes les animations d\'étoiles');

    // 🚨 CISCO: ARRÊT BRUTAL de toutes les animations GSAP sur les étoiles
    if (containerRef.current) {
      const starElements = containerRef.current.querySelectorAll('.fixed-star');
      starElements.forEach(element => {
        gsap.killTweensOf(element); // Arrêter les animations de chaque étoile
      });
    }

    // Stopper toutes les animations
    animationsRef.current.forEach(timeline => timeline.kill());
    animationsRef.current = [];

    // Supprimer tous les éléments étoiles
    if (containerRef.current) {
      const starElements = containerRef.current.querySelectorAll('.fixed-star');
      starElements.forEach(element => element.remove());
    }

    starsRef.current = [];

    console.log('✅ NETTOYAGE TERMINÉ: Toutes les animations d\'étoiles arrêtées');
  };

  // 🔧 CISCO: SYSTÈME DE ROTATION PROGRESSIVE - Optimisation CPU
  const startStarRotation = () => {
    if (skyMode !== 'night') return;

    const BATCH_SIZE = 15; // Nombre d'étoiles visibles simultanément
    const ROTATION_INTERVAL = 3000; // 3 secondes entre les rotations

    const rotateStars = () => {
      if (!containerRef.current || skyMode !== 'night') return;

      const allStars = containerRef.current.querySelectorAll('.fixed-star');
      if (allStars.length === 0) return;

      // Masquer les étoiles actuellement visibles
      activeStarsRef.current.forEach(index => {
        const star = allStars[index];
        if (star) {
          gsap.to(star, { opacity: 0, duration: 1, ease: "power2.inOut" });
        }
      });

      // Sélectionner de nouvelles étoiles aléatoirement
      const newActiveStars = new Set<number>();
      while (newActiveStars.size < Math.min(BATCH_SIZE, allStars.length)) {
        const randomIndex = Math.floor(Math.random() * allStars.length);
        newActiveStars.add(randomIndex);
      }

      // Afficher les nouvelles étoiles après un délai
      setTimeout(() => {
        newActiveStars.forEach(index => {
          const star = allStars[index];
          if (star) {
            const starData = starsRef.current[index];
            if (starData) {
              gsap.to(star, {
                opacity: starData.brightness,
                duration: 1.5,
                ease: "power2.out"
              });
            }
          }
        });

        activeStarsRef.current = newActiveStars;
      }, 1000);
    };

    // Première rotation immédiate
    rotateStars();

    // Rotation continue
    rotationTimerRef.current = setInterval(rotateStars, ROTATION_INTERVAL);
  };

  // 🔧 CISCO: Arrêter la rotation des étoiles
  const stopStarRotation = () => {
    if (rotationTimerRef.current) {
      clearInterval(rotationTimerRef.current);
      rotationTimerRef.current = null;
    }
    activeStarsRef.current.clear();
  };

  // 🔧 CISCO: Mise à jour de la visibilité - CORRECTION ERREUR
  const updateVisibility = (duration: number = 8.0) => {
    if (!containerRef.current) return;

    const visibility = getVisibility(skyMode);
    const starElements = containerRef.current.querySelectorAll('.fixed-star');

    console.log(`⭐ Transition progressive des étoiles vers opacité ${visibility} (durée: ${duration}s) - ${starElements.length} étoiles trouvées`);

    // 🔧 CISCO: CORRECTION - Appliquer la visibilité de base sans écraser les animations de scintillement
    starElements.forEach((element: Element) => {
      const htmlElement = element as HTMLElement;

      // 🌟 CISCO: Appliquer la visibilité de base comme propriété CSS, pas via GSAP
      // Cela permet aux animations de scintillement de fonctionner par-dessus
      htmlElement.style.setProperty('--base-opacity', visibility.toString());

      // 🌟 CISCO: Pour le mode nuit, s'assurer que les étoiles sont bien visibles
      if (skyMode === 'night') {
        // Forcer la visibilité immédiate en mode nuit
        gsap.set(htmlElement, { opacity: visibility });
        console.log(`⭐ Étoile ${htmlElement.id} forcée visible en mode nuit`);
      } else {
        // Pour les autres modes, transition douce
        gsap.to(htmlElement, {
          opacity: visibility,
          duration: duration,
          ease: "power1.inOut",
          overwrite: 'auto' // 🔧 CISCO: 'auto' au lieu de true pour préserver les animations
        });
      }
    });
  };

  // 🔧 CISCO: Initialisation au montage seulement (pas de régénération sur skyMode)
  useEffect(() => {
    initializeStars();
    return () => {
      stopStarRotation();
      cleanupStars();
    };
  }, [density]); // Régénérer seulement quand la densité change

  // 🔧 CISCO: CORRECTION URGENTE - Visibilité simple et directe
  useEffect(() => {
    console.log(`🌌 FixedStars: Transition vers mode ${skyMode}`);
    console.log(`🔍 DIAGNOSTIC: Container existe? ${!!containerRef.current}`);
    console.log(`🔍 DIAGNOSTIC: Étoiles créées? ${starsRef.current.length}`);

    if (skyMode === 'night') {
      // Mode nuit : TOUTES les étoiles visibles avec leur luminosité naturelle
      console.log('⭐ AFFICHAGE IMMÉDIAT de toutes les étoiles');

      if (containerRef.current) {
        const starElements = containerRef.current.querySelectorAll('.fixed-star');
        console.log(`⭐ ${starElements.length} étoiles trouvées dans le DOM, rendu visible`);
        console.log(`🔍 DIAGNOSTIC: Étoiles en mémoire: ${starsRef.current.length}`);

        starElements.forEach((element: Element, index: number) => {
          const htmlElement = element as HTMLElement;
          const star = starsRef.current[index];
          if (star) {
            // Rendre visible avec la luminosité naturelle de l'étoile
            console.log(`⭐ Étoile ${index} rendue visible avec opacité ${star.brightness}`);
            gsap.set(htmlElement, { opacity: star.brightness });
          } else {
            console.warn(`⚠️ Étoile ${index} manquante en mémoire`);
          }
        });
      } else {
        console.error(`❌ PROBLÈME: Container non disponible pour affichage étoiles`);
      }
    } else {
      // Autres modes : masquer toutes les étoiles
      console.log('🌙 Masquage des étoiles pour mode non-nuit');

      if (containerRef.current) {
        const starElements = containerRef.current.querySelectorAll('.fixed-star');
        starElements.forEach((element: Element) => {
          gsap.set(element as HTMLElement, { opacity: 0 });
        });
      }
    }
  }, [skyMode]);

  return (
    <div
      ref={containerRef}
      className="fixed absolute inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 7 }} // 🔧 CISCO: Étoiles derrière lune (z-index 7) - VERROUILLÉ
    />
  );
};

export default FixedStars;
