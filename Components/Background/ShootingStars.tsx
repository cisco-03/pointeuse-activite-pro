import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Interface pour une étoile filante
interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  duration: number;
  brightness: number;
  size: number;
  delay: number;
}

// Interface pour les props du composant
interface ShootingStarsProps {
  skyMode: string; // Mode du ciel pour ajuster la visibilité
}

const ShootingStars: React.FC<ShootingStarsProps> = ({ skyMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const intervalsRef = useRef<NodeJS.Timeout[]>([]);

  // Fonction pour générer une étoile filante aléatoire
  const generateShootingStar = (): ShootingStar => {
    const id = Math.floor(Math.random() * 1000000);
    
    // 🔧 CORRECTION: Position de départ plus variée et naturelle
    const startX = 20 + Math.random() * 60; // Entre 20% et 80% de l'écran
    const startY = -5 + Math.random() * 25; // Entre -5% et 20% (plus varié)
    
    // 🔧 CORRECTION: Trajectoire diagonale plus naturelle
    const diagonalDistance = 60 + Math.random() * 40; // Distance diagonale variable
    const endX = startX - diagonalDistance * 0.7; // Mouvement diagonal vers la gauche
    const endY = startY + diagonalDistance; // Mouvement diagonal vers le bas
    
    // Caractéristiques de l'étoile - plus variées
    const duration = 0.8 + Math.random() * 2.2; // Entre 0.8 et 3.0 secondes (plus varié)
    const brightness = 0.6 + Math.random() * 0.4; // Entre 0.6 et 1.0
    const size = 1.8 + Math.random() * 3.2; // Entre 1.8px et 5.0px
    const delay = Math.random() * 3; // Délai avant apparition plus varié
    
    return {
      id,
      startX,
      startY,
      endX,
      endY,
      duration,
      brightness,
      size,
      delay
    };
  };

  // Fonction pour créer et animer une étoile filante
  const createShootingStar = (star: ShootingStar) => {
    if (!containerRef.current) return;

    // 🔧 AMÉLIORATION: Calculer l'angle de rotation pour la trajectoire diagonale
    const deltaX = star.endX - star.startX;
    const deltaY = star.endY - star.startY;
    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    // Créer l'élément étoile avec effet lumineux amélioré
    const starElement = document.createElement('div');
    starElement.className = 'shooting-star';
    starElement.style.cssText = `
      position: absolute;
      left: ${star.startX}%;
      top: ${star.startY}%;
      width: ${star.size}px;
      height: ${star.size}px;
      background: radial-gradient(ellipse 2px 4px, rgba(255,255,255,${star.brightness}) 0%, rgba(255,255,255,0.9) 20%, rgba(135,206,235,0.6) 40%, transparent 80%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 20;
      box-shadow: 
        0 0 ${star.size * 3}px rgba(255,255,255,${star.brightness}), 
        0 0 ${star.size * 6}px rgba(135,206,235,0.5),
        0 0 ${star.size * 9}px rgba(135,206,235,0.2);
      filter: blur(0.2px);
    `;

    // 🔧 CORRECTION: Traînée allongée et orientée selon la trajectoire
    const trailElement = document.createElement('div');
    trailElement.className = 'shooting-star-trail';
    const trailLength = 35 + star.size * 6; // Traînée plus longue
    trailElement.style.cssText = `
      position: absolute;
      left: ${star.startX}%;
      top: ${star.startY}%;
      width: 4px;
      height: ${trailLength}px;
      background: linear-gradient(to bottom, 
        rgba(255,255,255,${star.brightness * 0.95}) 0%, 
        rgba(135,206,235,${star.brightness * 0.8}) 25%,
        rgba(135,206,235,${star.brightness * 0.6}) 50%,
        rgba(135,206,235,${star.brightness * 0.3}) 75%,
        transparent 100%);
      pointer-events: none;
      z-index: 19;
      transform-origin: top center;
      transform: rotate(${angle + 90}deg);
      border-radius: 2px;
      filter: blur(0.4px);
    `;

    // 🔧 AJOUT: Beaucoup plus de micro-étoiles pour effet réaliste
    const microStars: HTMLElement[] = [];
    const microStarCount = 8 + Math.floor(Math.random() * 12); // Entre 8 et 20 micro-étoiles
    
    for (let i = 0; i < microStarCount; i++) {
      const microStar = document.createElement('div');
      microStar.className = 'micro-star';
      const microSize = 0.2 + Math.random() * 0.8; // Vraiment microscopiques (0.2px à 1px)
      const offsetX = star.startX + (Math.random() - 0.5) * 25; // Dispersion plus large
      const offsetY = star.startY + (Math.random() - 0.5) * 25;
      const opacity = 0.3 + Math.random() * 0.5; // Opacité variable
      
      microStar.style.cssText = `
        position: absolute;
        left: ${offsetX}%;
        top: ${offsetY}%;
        width: ${microSize}px;
        height: ${microSize}px;
        background: rgba(255,255,255,${opacity});
        border-radius: 50%;
        pointer-events: none;
        z-index: 18;
        box-shadow: 0 0 ${microSize * 3}px rgba(255,255,255,${opacity * 0.8});
      `;
      
      microStars.push(microStar);
      containerRef.current.appendChild(microStar);
    }

    containerRef.current.appendChild(starElement);
    containerRef.current.appendChild(trailElement);

    // Animation avec GSAP - plus fluide et réaliste
    const timeline = gsap.timeline({
      delay: star.delay,
      onComplete: () => {
        // Nettoyer les éléments après l'animation
        starElement.remove();
        trailElement.remove();
        microStars.forEach(micro => micro.remove());
      }
    });

    // Animation de l'étoile principale avec accélération réaliste
    timeline.to(starElement, {
      left: `${star.endX}%`,
      top: `${star.endY}%`,
      opacity: 0,
      duration: star.duration,
      ease: "power3.out"
    });

    // Animation de la traînée (plus longue et avec rotation maintenue)
    timeline.to(trailElement, {
      left: `${star.endX}%`,
      top: `${star.endY}%`,
      scaleY: 0.3,
      scaleX: 0.6,
      opacity: 0,
      duration: star.duration * 1.4,
      ease: "power2.out"
    }, 0.05);

    // Animation des micro-étoiles
    microStars.forEach((microStar, index) => {
      const microEndX = star.endX + (Math.random() - 0.5) * 20;
      const microEndY = star.endY + (Math.random() - 0.5) * 20;
      
      timeline.to(microStar, {
        left: `${microEndX}%`,
        top: `${microEndY}%`,
        opacity: 0,
        scale: 0.2,
        duration: star.duration * (0.8 + Math.random() * 0.4),
        ease: "power2.out"
      }, index * 0.1);
    });
  };

  // Fonction pour démarrer la génération automatique d'étoiles filantes
  const startShootingStars = () => {
    // Arrêter les intervalles existants
    intervalsRef.current.forEach(interval => clearInterval(interval));
    intervalsRef.current = [];

    // Fonction pour créer une étoile périodiquement
    const createPeriodicStar = () => {
      const star = generateShootingStar();
      createShootingStar(star);
    };

    // Créer plusieurs intervalles avec des fréquences différentes selon le mode
    let intervals: NodeJS.Timeout[];
    
    if (skyMode === 'night') {
      // Mode nuit : plus d'étoiles filantes
      intervals = [
        setInterval(createPeriodicStar, 5000 + Math.random() * 8000), // Toutes les 5-13 secondes
        setInterval(createPeriodicStar, 10000 + Math.random() * 12000), // Toutes les 10-22 secondes
        setInterval(createPeriodicStar, 15000 + Math.random() * 15000), // Toutes les 15-30 secondes
        setInterval(createPeriodicStar, 20000 + Math.random() * 25000), // Toutes les 20-45 secondes
      ];
    } else {
      // Modes dusk/dawn : moins fréquent
      intervals = [
        setInterval(createPeriodicStar, 15000 + Math.random() * 20000), // Toutes les 15-35 secondes
        setInterval(createPeriodicStar, 25000 + Math.random() * 30000), // Toutes les 25-55 secondes
      ];
    }

    intervalsRef.current = intervals;

    // Créer immédiatement quelques étoiles pour commencer selon le mode
    if (skyMode === 'night') {
      setTimeout(() => createPeriodicStar(), 1000);
      setTimeout(() => createPeriodicStar(), 4000);
      setTimeout(() => createPeriodicStar(), 8000);
    } else {
      setTimeout(() => createPeriodicStar(), 3000);
      setTimeout(() => createPeriodicStar(), 12000);
    }
  };

  // Effet pour gérer la visibilité selon le mode du ciel avec transition progressive
  useEffect(() => {
    if (!containerRef.current) return;

    // Visibilité selon le mode
    const shouldShow = ['night', 'dusk', 'dawn'].includes(skyMode);
    const targetOpacity = shouldShow ? (skyMode === 'night' ? 1 : 0.3) : 0;

    console.log(`🌠 Transition progressive des étoiles filantes vers opacité ${targetOpacity} (mode: ${skyMode})`);

    // CISCO: Transition progressive synchronisée (15 secondes comme le background)
    gsap.to(containerRef.current, {
      opacity: targetOpacity,
      duration: 15.0, // CISCO: Harmonisation à 15 secondes
      ease: "power1.inOut",
      overwrite: true
    });

    if (shouldShow) {
      startShootingStars();
    } else {
      // Arrêter la génération d'étoiles filantes en journée
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current = [];
    }

    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
      intervalsRef.current = [];
    };
  }, [skyMode]);

  // Nettoyage lors du démontage
  useEffect(() => {
    return () => {
      intervalsRef.current.forEach(interval => clearInterval(interval));
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 18,
        transition: 'opacity 3s ease-in-out'
      }}
    />
  );
};

export default ShootingStars;
