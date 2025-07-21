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

  // État pour la géolocalisation
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number}>({
    lat: 48.8566, // Paris par défaut
    lon: 2.3522
  });

  // État pour savoir si la géolocalisation est prête
  const [locationReady, setLocationReady] = useState(false);

  // Obtenir la géolocalisation de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setLocationReady(true); // 🔑 CLEF: Marquer la géolocalisation comme prête
          console.log(`📍 Position obtenue: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} - Calculs astronomiques activés !`);
        },
        (error) => {
          console.warn('❌ Géolocalisation refusée, utilisation de Paris par défaut:', error.message);
          setLocationReady(true); // Même en cas d'erreur, on active avec Paris par défaut
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
      console.warn('❌ Géolocalisation non supportée par ce navigateur');
      setLocationReady(true); // Activer avec Paris par défaut
    }
  };

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

  // Calculer l'opacité des étoiles selon les données astronomiques réelles
  const calculateStarsOpacity = (currentTime: Date): number => {
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

    // CORRECTION TEMPORAIRE: Forcer les étoiles à 0 entre 6h et 19h (heure d'hiver approximative)
    if (currentHour >= 6 && currentHour <= 19) {
      console.log(`☀️ JOUR FORCÉ: ${currentHour.toFixed(2)}h entre 6h et 19h → Étoiles: 0 (RETOUR IMMÉDIAT)`);
      return 0;
    }

    // Période de jour complet : pas d'étoiles visibles (calcul SunCalc)
    if (currentHour >= sunrise && currentHour <= sunset) {
      console.log(`☀️ JOUR SUNCALC: ${currentHour.toFixed(2)}h entre ${sunrise.toFixed(2)}h et ${sunset.toFixed(2)}h → Étoiles: 0`);
      return 0;
    }

    // Transition progressive après le coucher du soleil
    if (currentHour > sunset && currentHour <= nauticalDusk) {
      const progress = (currentHour - sunset) / (nauticalDusk - sunset);
      const opacity = progress * 0.4;
      console.log(`🌅 CRÉPUSCULE: ${currentHour.toFixed(2)}h après coucher ${sunset.toFixed(2)}h → Étoiles: ${opacity.toFixed(2)}`);
      return opacity;
    }

    // Transition vers la nuit complète (crépuscule nautique → nuit)
    if (currentHour > nauticalDusk && currentHour <= nauticalDusk + 0.5) {
      const progress = (currentHour - nauticalDusk) / 0.5;
      const opacity = 0.4 + (progress * 0.6);
      console.log(`🌌 DÉBUT NUIT: ${currentHour.toFixed(2)}h → Étoiles: ${opacity.toFixed(2)}`);
      return opacity;
    }

    // Nuit complète : toutes les étoiles visibles
    if (currentHour > nauticalDusk + 0.5 && currentHour < nauticalDawn - 0.5) {
      console.log(`🌙 NUIT COMPLÈTE: ${currentHour.toFixed(2)}h → Étoiles: 1.0`);
      return 1.0;
    }

    // Transition avant l'aube (nuit → crépuscule nautique)
    if (currentHour >= nauticalDawn - 0.5 && currentHour < nauticalDawn) {
      const progress = (currentHour - (nauticalDawn - 0.5)) / 0.5;
      const opacity = 1.0 - (progress * 0.6);
      console.log(`🌄 FIN NUIT: ${currentHour.toFixed(2)}h → Étoiles: ${opacity.toFixed(2)}`);
      return opacity;
    }

    // Transition progressive avant le lever du soleil
    if (currentHour >= nauticalDawn && currentHour < sunrise) {
      const progress = (currentHour - nauticalDawn) / (sunrise - nauticalDawn);
      const opacity = 0.4 * (1 - progress);
      console.log(`🌇 AUBE: ${currentHour.toFixed(2)}h avant lever ${sunrise.toFixed(2)}h → Étoiles: ${opacity.toFixed(2)}`);
      return opacity;
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

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentSecond = now.getSeconds();

    // Calcul précis de l'heure avec minutes et secondes pour l'affichage
    const preciseHour = currentHour + currentMinute / 60 + currentSecond / 3600;

    // Calculer les opacités avec les données astronomiques réelles
    const newStarsOpacity = calculateStarsOpacity(now);
    const newMoonOpacity = calculateMoonOpacity(now);
    const newMoonPhase = calculateMoonPhase();

    // Obtenir les heures de lever/coucher pour le debug avec la position de l'utilisateur
    const sunTimes = SunCalc.getTimes(now, userLocation.lat, userLocation.lon);
    const sunrise = sunTimes.sunrise.getHours() + sunTimes.sunrise.getMinutes() / 60;
    const sunset = sunTimes.sunset.getHours() + sunTimes.sunset.getMinutes() / 60;

    console.log(`🕐${preciseHour.toFixed(2)}h | 🌅${sunrise.toFixed(2)}h | 🌇${sunset.toFixed(2)}h | ⭐${newStarsOpacity.toFixed(2)} | 🌙${newMoonOpacity.toFixed(2)}`);

    // Mettre à jour les états
    setStarsOpacity(newStarsOpacity);
    setMoonOpacity(newMoonOpacity);
    setMoonPhase(newMoonPhase);
  };

  // Obtenir la géolocalisation au démarrage (désactivé à cause des restrictions navigateur)
  // useEffect(() => {
  //   getUserLocation();
  // }, []);

  // Démarrer avec Paris par défaut et marquer comme prêt
  useEffect(() => {
    console.log('🏁 Démarrage avec Paris par défaut (géolocalisation manuelle)');
    setLocationReady(true);
  }, []);

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

  // Animer l'opacité des étoiles avec optimisations
  useEffect(() => {
    if (!containerRef.current) return;

    const starElements = containerRef.current.querySelectorAll('[data-star]');
    console.log(`🌟 Étoiles trouvées: ${starElements.length}, Opacité cible: ${starsOpacity}`);

    // 🔑 CLEF: Gérer les animations de scintillement selon l'opacité
    if (starsOpacity === 0) {
      // JOUR: Arrêter toutes les animations et forcer opacité à 0
      console.log('☀️ JOUR: Arrêt des animations de scintillement');
      animationsRef.current.forEach(animation => animation.pause());

      starElements.forEach((star: Element, index) => {
        const htmlStar = star as HTMLElement;
        // Tuer toute animation GSAP en cours sur cet élément
        gsap.killTweensOf(htmlStar);
        // Forcer l'opacité à 0 immédiatement
        gsap.set(htmlStar, { opacity: 0 });
        htmlStar.style.opacity = '0';

        if (index < 3) {
          console.log(`⭐ Étoile ${index} JOUR: animations tuées, opacité forcée à 0`);
        }
      });
    } else {
      // NUIT: Réactiver les animations et définir l'opacité de base
      console.log('🌙 NUIT: Réactivation des animations de scintillement');
      animationsRef.current.forEach(animation => animation.resume());

      starElements.forEach((star: Element, index) => {
        const htmlStar = star as HTMLElement;
        // Définir l'opacité de base (les animations vont prendre le relais)
        gsap.set(htmlStar, { opacity: starsOpacity });
        htmlStar.style.opacity = starsOpacity.toString();

        if (index < 3) {
          console.log(`⭐ Étoile ${index} NUIT: animations réactivées, opacité de base = ${starsOpacity}`);
        }
      });
    }
  }, [starsOpacity, locationReady]);

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
      {/* Bouton de géolocalisation (seulement si pas encore obtenue) */}
      {!locationReady && (
        <button
          onClick={getUserLocation}
          className="absolute top-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg pointer-events-auto z-10 text-sm"
        >
          📍 Activer géolocalisation
        </button>
      )}

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
