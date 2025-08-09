import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface MoonAnimationProps {
  isNightMode: boolean; // true quand mode = 'night'
  currentMode: string;  // pour détecter les changements de mode
}

const MoonAnimation: React.FC<MoonAnimationProps> = ({ isNightMode, currentMode }) => {
  const moonRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null); // 🔧 CISCO: Référence séparée pour le halo
  const animationRef = useRef<gsap.core.Timeline | null>(null);
  const fadeOutRef = useRef<gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef<boolean>(false); // 🔧 CISCO: Protection contre les déclenchements multiples

  useEffect(() => {
    if (!moonRef.current || !haloRef.current) return;

    // 🌙 CISCO: Mode Nuit profonde - Apparition et descente de la lune
    if (isNightMode && currentMode === 'night') {
      // 🔧 CISCO: PROTECTION RENFORCÉE - Éviter les déclenchements multiples
      if (isAnimatingRef.current) {
        console.log('🌙 Animation lune déjà en cours (protection renforcée) - éviter le redémarrage');
        return;
      }

      // 🔧 CISCO: Vérifier si l'animation GSAP est déjà active
      if (animationRef.current && animationRef.current.isActive()) {
        console.log('🌙 Animation GSAP lune déjà active - éviter le redémarrage');
        return;
      }

      console.log('🌙 DÉMARRAGE animation lune - Mode nuit profonde confirmé');
      isAnimatingRef.current = true; // 🔧 CISCO: Marquer comme en cours d'animation

      // Arrêter toute animation en cours
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (fadeOutRef.current) {
        fadeOutRef.current.kill();
      }

      // 🔧 CISCO: Position initiale de la lune - haut gauche de l'écran
      gsap.set(moonRef.current, {
        x: '15vw', // Plus à gauche pour commencer la courbe
        y: '10vh', // Plus haut pour la courbe parabolique
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        scale: 1,
        display: 'block'
      });

      // Position initiale du halo (même position que la lune)
      gsap.set(haloRef.current, {
        x: '15vw',
        y: '10vh',
        xPercent: -50,
        yPercent: -50,
        opacity: 0,
        display: 'block'
      });

      // 🔧 CISCO: Timeline avec DÉLAI pour synchronisation avec dégradé
      animationRef.current = gsap.timeline({
        delay: 15, // 🔧 CISCO: Attendre 15 secondes - fin du dégradé de nuit
        onComplete: () => {
          console.log('🌙 Animation lune terminée - Libération du verrou');
          isAnimatingRef.current = false; // 🔧 CISCO: Libérer le verrou à la fin
        }
      });

      // 🌙 CISCO: Phase 1: Apparition APRÈS le dégradé complet
      animationRef.current.to(moonRef.current, {
        opacity: 1.0,
        duration: 5, // Plus lent pour apparition naturelle
        ease: "power2.out"
      });

      // Apparition du halo synchronisée
      animationRef.current.to(haloRef.current, {
        opacity: 0.25,
        duration: 5,
        ease: "power2.out"
      }, 0);

      // 🔧 CISCO: Phase 2: Trajectoire diagonale CORRIGÉE - Lune vient du HAUT
      // Position initiale HORS ÉCRAN en haut, puis descente diagonale
      // Durée : 600 secondes (10 minutes) pour mouvement très lent

      // 🌙 CISCO: Animation lune - Trajectoire diagonale du HAUT vers BAS-DROITE
      animationRef.current.to(moonRef.current, {
        keyframes: [
          // Lune commence HORS ÉCRAN en haut-gauche et descend en diagonale
          { x: '5vw', y: '-5vh', duration: 0 },     // HORS ÉCRAN - haut-gauche
          { x: '15vw', y: '2vh', duration: 0.1 },   // Entre dans l'écran
          { x: '25vw', y: '8vh', duration: 0.2 },   // Descente diagonale
          { x: '35vw', y: '15vh', duration: 0.3 },  // Continue la diagonale
          { x: '45vw', y: '25vh', duration: 0.4 },  // Milieu de l'écran
          { x: '55vw', y: '35vh', duration: 0.5 },  // Descente continue
          { x: '65vw', y: '45vh', duration: 0.6 },  // Descente progressive
          { x: '75vw', y: '55vh', duration: 0.7 },  // Approche finale
          { x: '85vw', y: '65vh', duration: 0.85 }, // Descente finale
          { x: '95vw', y: '75vh', duration: 1.0 }   // Sort par bas-droite
        ],
        duration: 600, // 🔧 CISCO: 10 minutes - très lent et naturel
        ease: "none", // Vitesse constante pour réalisme astronomique
        transformOrigin: "center center"
      }, 5); // Commence après apparition complète (5s)

      // 🌙 CISCO: Halo suit exactement la même trajectoire
      animationRef.current.to(haloRef.current, {
        keyframes: [
          { x: '5vw', y: '-5vh', duration: 0 },
          { x: '15vw', y: '2vh', duration: 0.1 },
          { x: '25vw', y: '8vh', duration: 0.2 },
          { x: '35vw', y: '15vh', duration: 0.3 },
          { x: '45vw', y: '25vh', duration: 0.4 },
          { x: '55vw', y: '35vh', duration: 0.5 },
          { x: '65vw', y: '45vh', duration: 0.6 },
          { x: '75vw', y: '55vh', duration: 0.7 },
          { x: '85vw', y: '65vh', duration: 0.85 },
          { x: '95vw', y: '75vh', duration: 1.0 }
        ],
        duration: 600,
        ease: "none"
      }, 5);

    } else if (!isNightMode && currentMode !== 'night') {
      // Arrêter l'animation de descente
      if (animationRef.current) {
        animationRef.current.kill();
        animationRef.current = null;
      }

      // Si la lune est visible, la faire disparaître en douceur avec le halo
      if (moonRef.current && gsap.getProperty(moonRef.current, "opacity") > 0) {
        fadeOutRef.current = gsap.timeline();

        // Disparition de la lune
        fadeOutRef.current.to(moonRef.current, {
          opacity: 0,
          duration: 8,
          ease: "power2.in"
        });

        // Disparition du halo en parallèle
        fadeOutRef.current.to(haloRef.current, {
          opacity: 0,
          duration: 8,
          ease: "power2.in",
          onComplete: () => {
            if (moonRef.current && haloRef.current) {
              gsap.set(moonRef.current, { display: 'none' });
              gsap.set(haloRef.current, { display: 'none' });
            }
          }
        }, 0); // En même temps que la lune
      } else {
        // Si déjà invisible, juste les cacher
        gsap.set(moonRef.current, { display: 'none' });
        gsap.set(haloRef.current, { display: 'none' });
      }
    }

    // Nettoyage au démontage
    return () => {
      if (animationRef.current) {
        animationRef.current.kill();
      }
      if (fadeOutRef.current) {
        fadeOutRef.current.kill();
      }
    };
  }, [isNightMode, currentMode]);

  return (
    <>
      {/* 🌙 CISCO: Halo lumineux séparé pour éviter l'effet carré */}
      <div
        ref={haloRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 8, // 🔧 CISCO: Lune + Halo derrière les nuages (z-index 8)
          display: 'none',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.08) 30%, rgba(255, 255, 255, 0.04) 60%, transparent 100%)', // 🔧 CISCO: Halo plus lumineux
          borderRadius: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* 🌙 CISCO: Lune principale */}
      <div
        ref={moonRef}
        className="fixed top-0 left-0 pointer-events-none"
        style={{
          zIndex: 8, // 🔧 CISCO: Lune + Halo derrière les nuages (z-index 8)
          display: 'none',
          width: '120px',
          height: '120px',
          backgroundImage: 'url(/Lune-Moon.png)',
          backgroundSize: 'contain',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          filter: 'brightness(1.6) contrast(1.3)', // 🔧 CISCO: Plus lumineuse (était 1.3/1.1)
        }}
        title="🌙 Lune nocturne"
      />
    </>
  );
};

export default MoonAnimation;
