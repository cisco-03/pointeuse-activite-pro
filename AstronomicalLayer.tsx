import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import * as SunCalc from 'suncalc';
import { useTime } from './TimeContext';
import { useLocation } from './LocationContext';

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
  const { getCurrentTime } = useTime();
  const { userLocation, locationReady } = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const starsRef = useRef<Star[]>([]);
  const moonRef = useRef<HTMLDivElement>(null);
  const animationsRef = useRef<gsap.core.Timeline[]>([]);

  // État pour la visibilité des étoiles et de la lune
  const [visibleStarsCount, setVisibleStarsCount] = useState(0);
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
    const now = getCurrentTime(); // Utiliser le temps du contexte (réel ou simulé)
    const moonIllumination = SunCalc.getMoonIllumination(now);
    return moonIllumination.fraction; // 0 = nouvelle lune, 1 = pleine lune
  };

  // Calculer le nombre d'étoiles visibles selon les données astronomiques réelles
  const calculateVisibleStarsCount = (currentTime: Date): number => {
    const totalStars = 400; // Nombre total d'étoiles générées
    // Obtenir les données solaires pour aujourd'hui avec la position de l'utilisateur
    const sunTimes = SunCalc.getTimes(currentTime, userLocation.lat, userLocation.lon);

    // Heures importantes (en heures décimales)
    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;
    const nauticalDusk = sunTimes.nauticalDusk.getHours() + sunTimes.nauticalDusk.getMinutes() / 60;
    const nauticalDawn = sunTimes.nauticalDawn.getHours() + sunTimes.nauticalDawn.getMinutes() / 60;

    // Heure actuelle en format décimal
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;

    // DEBUG: Afficher toutes les valeurs pour comprendre le problème
    console.log(`🔍 DEBUG ÉTOILES:`, {
      currentHour: currentHour.toFixed(2),
      sunrise: sunrise.toFixed(2),
      sunset: sunset.toFixed(2),
      nauticalDawn: nauticalDawn.toFixed(2),
      nauticalDusk: nauticalDusk.toFixed(2),
      sunriseTime: sunTimes.sunrise.toLocaleTimeString(),
      sunsetTime: sunTimes.sunset.toLocaleTimeString()
    });

    // Période de jour complet : pas d'étoiles visibles (calcul SunCalc)
    if (currentHour >= sunrise && currentHour <= sunset) {
      console.log(`☀️ JOUR SUNCALC: ${currentHour.toFixed(2)}h entre ${sunrise.toFixed(2)}h et ${sunset.toFixed(2)}h → Étoiles: 0`);
      return 0;
    }

    // CRÉPUSCULE DU SOIR - Apparition progressive des premières étoiles
    if (currentHour > sunset && currentHour <= nauticalDusk) {
      const progress = (currentHour - sunset) / (nauticalDusk - sunset);
      // De 0 à 150 étoiles (les plus brillantes d'abord)
      const visibleCount = Math.floor(progress * 150);
      console.log(`🌅 CRÉPUSCULE SOIR: ${currentHour.toFixed(2)}h après coucher ${sunset.toFixed(2)}h → Étoiles: ${visibleCount}/${totalStars}`);
      return visibleCount;
    }

    // DÉBUT DE NUIT - Plus d'étoiles apparaissent
    if (currentHour > nauticalDusk && currentHour <= nauticalDusk + 0.75) {
      const progress = (currentHour - nauticalDusk) / 0.75;
      // De 150 à 300 étoiles
      const visibleCount = Math.floor(150 + (progress * 150));
      console.log(`🌌 DÉBUT NUIT: ${currentHour.toFixed(2)}h → Étoiles: ${visibleCount}/${totalStars}`);
      return visibleCount;
    }

    // NUIT COMPLÈTE - Toutes les étoiles visibles
    if (currentHour > nauticalDusk + 0.75 && currentHour < nauticalDawn - 0.75) {
      console.log(`🌙 NUIT COMPLÈTE: ${currentHour.toFixed(2)}h → Étoiles: ${totalStars}/${totalStars}`);
      return totalStars;
    }

    // FIN DE NUIT - Les étoiles commencent à disparaître
    if (currentHour >= nauticalDawn - 0.75 && currentHour < nauticalDawn) {
      const progress = (currentHour - (nauticalDawn - 0.75)) / 0.75;
      // De 400 à 150 étoiles
      const visibleCount = Math.floor(totalStars - (progress * 250));
      console.log(`🌄 FIN NUIT: ${currentHour.toFixed(2)}h → Étoiles: ${visibleCount}/${totalStars}`);
      return visibleCount;
    }

    // AUBE - Disparition progressive des étoiles
    if (currentHour >= nauticalDawn && currentHour < sunrise) {
      const progress = (currentHour - nauticalDawn) / (sunrise - nauticalDawn);
      // De 150 à 0 étoiles
      const visibleCount = Math.floor(150 * (1 - progress));
      console.log(`� AUBE: ${currentHour.toFixed(2)}h avant lever ${sunrise.toFixed(2)}h → Étoiles: ${visibleCount}/${totalStars}`);
      return visibleCount;
    }

    // Cas par défaut (ne devrait pas arriver)
    console.log(`❓ CAS DÉFAUT: ${currentHour.toFixed(2)}h → Étoiles: 0`);
    return 0;
  };

  // Calculer l'opacité de la lune selon les données astronomiques réelles
  const calculateMoonOpacity = (currentTime: Date): number => {
    // Obtenir les données solaires pour aujourd'hui avec la position de l'utilisateur
    const sunTimes = SunCalc.getTimes(currentTime, userLocation.lat, userLocation.lon);

    // Heures importantes (en heures décimales)
    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;

    // Heure actuelle en format décimal
    const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;

    // Période de jour : lune pas visible (ou très faiblement)
    if (currentHour >= sunrise + 1 && currentHour <= sunset - 1) {
      return 0;
    }

    // Transition progressive après le coucher du soleil
    if (currentHour > sunset - 1 && currentHour <= sunset + 0.5) {
      const progress = (currentHour - (sunset - 1)) / 1.5;
      return progress * 0.8; // Apparition progressive jusqu'à 80%
    }

    // Nuit complète : lune visible
    if (currentHour > sunset + 0.5 && currentHour < sunrise - 0.5) {
      return 0.8;
    }

    // Transition progressive avant le lever du soleil
    if (currentHour >= sunrise - 0.5 && currentHour < sunrise + 1) {
      const progress = (currentHour - (sunrise - 0.5)) / 1.5;
      return 0.8 * (1 - progress); // Disparition progressive de 80% à 0%
    }

    // Cas par défaut
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
    // 🔑 CLEF: Ne pas calculer tant que la géolocalisation n'est pas prête
    if (!locationReady) {
      console.log('⏳ Attente de la géolocalisation...');
      return;
    }

    const now = getCurrentTime(); // Utiliser le temps du contexte (réel ou simulé)
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Calcul précis de l'heure avec minutes et secondes pour l'affichage
    const preciseHour = currentHour + currentMinute / 60 + currentSecond / 3600;

    // Calculer le nombre d'étoiles visibles et les autres données astronomiques
    const newVisibleStarsCount = calculateVisibleStarsCount(now);
    const newMoonOpacity = calculateMoonOpacity(now);
    const newMoonPhase = calculateMoonPhase();

    // Obtenir les heures de lever/coucher pour le debug avec la position de l'utilisateur
    const sunTimes = SunCalc.getTimes(now, userLocation.lat, userLocation.lon);
    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;

    console.log(`🕐${preciseHour.toFixed(2)}h | 🌅${sunrise.toFixed(2)}h | 🌇${sunset.toFixed(2)}h | ⭐${newVisibleStarsCount}/400 | 🌙${newMoonOpacity.toFixed(2)}`);

    // Mettre à jour les états
    setVisibleStarsCount(newVisibleStarsCount);
    setMoonOpacity(newMoonOpacity);
    setMoonPhase(newMoonPhase);
  };



  // 🔑 CLEF: Forcer une mise à jour dès que la géolocalisation est prête
  useEffect(() => {
    if (locationReady) {
      console.log('🎯 Géolocalisation prête ! Mise à jour immédiate des calculs astronomiques...');
      updateAstronomicalDisplay();
    }
  }, [locationReady]);

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

  // Gérer la visibilité des étoiles selon le nombre calculé
  useEffect(() => {
    if (!containerRef.current) return;

    const starElements = containerRef.current.querySelectorAll('[data-star]');
    console.log(`🌟 Étoiles trouvées: ${starElements.length}, Nombre visible: ${visibleStarsCount}/400`);

    starElements.forEach((star: Element, index) => {
      const htmlStar = star as HTMLElement;

      if (index < visibleStarsCount) {
        // Étoile visible : activer avec opacité complète et scintillement
        gsap.set(htmlStar, { opacity: 1 });
        htmlStar.style.opacity = '1';
        htmlStar.style.display = 'block';

        // Réactiver l'animation de scintillement si elle existe
        const animation = animationsRef.current[index];
        if (animation && !animation.isActive()) {
          animation.resume();
        }

        if (index < 5) {
          console.log(`⭐ Étoile ${index} VISIBLE: activée avec scintillement`);
        }
      } else {
        // Étoile invisible : masquer complètement
        gsap.killTweensOf(htmlStar);
        gsap.set(htmlStar, { opacity: 0 });
        htmlStar.style.opacity = '0';
        htmlStar.style.display = 'none';

        // Arrêter l'animation de scintillement si elle existe
        const animation = animationsRef.current[index];
        if (animation && animation.isActive()) {
          animation.pause();
        }

        if (index < 5) {
          console.log(`⭐ Étoile ${index} MASQUÉE: désactivée`);
        }
      }
    });
  }, [visibleStarsCount, locationReady]);

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
      {/* Le bouton de géolocalisation est maintenant dans LocationTester */}

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
