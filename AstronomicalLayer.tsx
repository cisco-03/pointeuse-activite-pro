import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import * as SunCalc from 'suncalc';

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
  // Pas de props pour le moment
}

const AstronomicalLayer: React.FC<AstronomicalLayerProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);
  const moonRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<gsap.core.Timeline[]>([]);

  // État pour la visibilité des étoiles et de la lune
  const [starsOpacity, setStarsOpacity] = useState(0);
  const [moonOpacity, setMoonOpacity] = useState(0);
  const [moonPhase, setMoonPhase] = useState(0);

  // Générer les étoiles une seule fois
  const generateStars = (): Star[] => {
    const stars: Star[] = [];
    const starCount = 400; // Comme demandé !

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

  // Calculer la phase de lune actuelle
  const calculateMoonPhase = () => {
    const now = new Date();
    const moonIllumination = SunCalc.getMoonIllumination(now);
    return moonIllumination.fraction; // 0 = nouvelle lune, 1 = pleine lune
  };

  // Calculer l'opacité des étoiles selon l'heure
  const calculateStarsOpacity = (hour: number): number => {
    if (hour >= 7 && hour < 19) return 0; // Jour : pas d'étoiles
    if (hour >= 19 && hour < 20) return (hour - 19) * 0.3; // Apparition progressive
    if (hour >= 20 && hour < 21) return 0.3 + (hour - 20) * 0.7; // Apparition complète
    if (hour >= 21 || hour < 5) return 1; // Nuit : toutes les étoiles
    if (hour >= 5 && hour < 6) return 1 - (hour - 5) * 0.7; // Disparition progressive
    if (hour >= 6 && hour < 7) return 0.3 - (hour - 6) * 0.3; // Disparition finale
    return 0;
  };

  // Calculer l'opacité de la lune selon l'heure
  const calculateMoonOpacity = (hour: number): number => {
    if (hour >= 6 && hour < 18) return 0; // Jour : pas de lune visible
    if (hour >= 18 && hour < 19) return (hour - 18) * 0.8; // Apparition progressive
    if (hour >= 19 || hour < 5) return 0.8; // Nuit : lune visible
    if (hour >= 5 && hour < 6) return 0.8 - (hour - 5) * 0.8; // Disparition progressive
    return 0;
  };

  // Créer l'animation de scintillement optimisée pour une étoile
  const createStarTwinkle = (starElement: HTMLElement, star: Star) => {
    const timeline = gsap.timeline({
      repeat: -1,
      delay: star.twinkleDelay,
      // Optimisations performances
      force3D: true,
      willChange: "opacity, transform"
    });

    timeline
      .to(starElement, {
        opacity: star.brightness * 0.3,
        scale: 0.8,
        duration: 0.5 + Math.random() * 1,
        ease: "power1.inOut", // Ease plus léger
        force3D: true
      })
      .to(starElement, {
        opacity: star.brightness,
        scale: 1,
        duration: 0.5 + Math.random() * 1,
        ease: "power1.inOut",
        force3D: true
      });

    return timeline;
  };

  // Mettre à jour l'affichage astronomique
  const updateAstronomicalDisplay = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();
    
    // Calcul précis de l'heure avec minutes et secondes
    const preciseHour = currentHour + currentMinute / 60 + currentSecond / 3600;
    
    // Calculer les opacités
    const newStarsOpacity = calculateStarsOpacity(preciseHour);
    const newMoonOpacity = calculateMoonOpacity(preciseHour);
    const newMoonPhase = calculateMoonPhase();

    console.log(`🕐 Heure: ${preciseHour.toFixed(2)}h, Étoiles: ${newStarsOpacity}, Lune: ${newMoonOpacity}`);

    // Mettre à jour les états
    setStarsOpacity(newStarsOpacity);
    setMoonOpacity(newMoonOpacity);
    setMoonPhase(newMoonPhase);
  };

  // Initialiser les étoiles
  useEffect(() => {
    if (!containerRef.current) return;

    // Générer les étoiles
    starsRef.current = generateStars();

    // Créer les éléments DOM pour les étoiles avec optimisations
    starsRef.current.forEach((star, index) => {
      const starElement = document.createElement('div');
      starElement.className = 'absolute rounded-full bg-white pointer-events-none';
      starElement.style.left = `${star.x}%`;
      starElement.style.top = `${star.y}%`;
      starElement.style.width = `${star.size}px`;
      starElement.style.height = `${star.size}px`;
      starElement.style.opacity = '0';
      starElement.setAttribute('data-star', 'true');
      starElement.style.boxShadow = '0 0 2px rgba(255, 255, 255, 0.8)';
      // Optimisations CSS pour les performances
      starElement.style.willChange = 'opacity, transform';
      starElement.style.backfaceVisibility = 'hidden';
      starElement.style.transform = 'translateZ(0)'; // Force GPU

      containerRef.current?.appendChild(starElement);

      // Créer l'animation de scintillement seulement pour certaines étoiles (optimisation)
      if (index % 2 === 0) { // Une étoile sur deux scintille pour économiser les ressources
        const twinkleAnimation = createStarTwinkle(starElement, star);
        animationsRef.current.push(twinkleAnimation);
      }
    });

    // Mise à jour initiale avec un petit délai pour s'assurer que les éléments sont créés
    setTimeout(() => {
      updateAstronomicalDisplay();
    }, 100);

    // Mise à jour toutes les secondes
    const interval = setInterval(updateAstronomicalDisplay, 1000);

    // Nettoyage
    return () => {
      clearInterval(interval);
      animationsRef.current.forEach(animation => animation.kill());
      animationsRef.current = [];
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  // Animer l'opacité des étoiles avec optimisations
  useEffect(() => {
    if (!containerRef.current) return;

    const starElements = containerRef.current.querySelectorAll('[data-star]');
    console.log(`🌟 Étoiles trouvées: ${starElements.length}, Opacité cible: ${starsOpacity}`);

    // Méthode directe CSS + GSAP pour s'assurer que l'opacité est appliquée
    starElements.forEach((star: Element, index) => {
      const htmlStar = star as HTMLElement;
      // Forcer l'opacité immédiatement via CSS
      htmlStar.style.opacity = starsOpacity.toString();

      // Puis animer avec GSAP pour les transitions futures
      gsap.set(htmlStar, { opacity: starsOpacity });
    });
  }, [starsOpacity]);

  // Animer la lune
  useEffect(() => {
    if (!moonRef.current) return;

    gsap.to(moonRef.current, {
      opacity: moonOpacity,
      duration: 2,
      ease: "power2.out"
    });
  }, [moonOpacity]);

  // Calculer l'apparence de la lune selon sa phase
  const getMoonStyle = () => {
    const size = 40;
    const shadowOffset = (0.5 - moonPhase) * size;
    
    return {
      width: `${size}px`,
      height: `${size}px`,
      background: 'radial-gradient(circle, #f5f5dc 30%, #e6e6fa 70%)',
      borderRadius: '50%',
      boxShadow: `inset ${shadowOffset}px 0 0 rgba(0, 0, 0, 0.3), 0 0 10px rgba(245, 245, 220, 0.5)`,
    };
  };

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Lune */}
      <div
        ref={moonRef}
        data-moon="true"
        className="absolute pointer-events-none"
        style={{
          top: '15%',
          right: '15%',
          opacity: 0,
          ...getMoonStyle()
        }}
      />
    </div>
  );
};

export default AstronomicalLayer;
