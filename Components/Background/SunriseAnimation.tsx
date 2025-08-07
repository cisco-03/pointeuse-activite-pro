import React, { useLayoutEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';

// Interface pour les méthodes exposées du composant
export interface SunriseAnimationRef {
  triggerSunrise: () => void;
  triggerMorning: () => void;
  triggerMidday: () => void;
  triggerAfternoon: () => void;
  triggerSunset: () => void;
  triggerDawn: () => void;
  triggerDusk: () => void;
  triggerNight: () => void;
  resetSun: () => void;
}

// Interface pour les props du composant
interface SunriseAnimationProps {
  isVisible: boolean;
}

// 🔧 CISCO: NOUVEAU SYSTÈME DE COORDONNÉES SOLAIRES
// Ligne d'horizon = 0° (milieu de l'écran)
// Valeurs négatives = sous l'horizon, positives = au-dessus
const SUN_POSITIONS = {
  dawn: { angle: -15, horizontalOffset: -60 },      // Sous horizon, position Est
  sunrise: { angle: 25, horizontalOffset: -30 },    // Au-dessus horizon, légèrement Est
  morning: { angle: 103.5, horizontalOffset: -40 }, // CISCO: Y=-115%, X=-40% (spécifications exactes)
  midday: { angle: 215, horizontalOffset: -140 },   // CISCO: Y=-215%, X=-140% (spécifications exactes)
  afternoon: { angle: 103.5, horizontalOffset: -40 }, // CISCO: Même position que matin - symétrie parfaite
  sunset: { angle: 25, horizontalOffset: 45 },      // Même hauteur que lever, position Ouest
  dusk: { angle: -20, horizontalOffset: 60 },       // Sous horizon, position Ouest
  night: { angle: -25, horizontalOffset: 0 }        // Très bas, position centrale
} as const;

// 🔧 CISCO: Fonction de conversion angle → position CSS
const angleToPosition = (angle: number, horizontalOffset: number = 0) => {
  // Conversion angle en position Y (0° = milieu écran)
  // -90° = 100% (tout en bas), +90° = -100% (tout en haut)
  const yPosition = -angle * (100 / 90); // Conversion linéaire
  
  // Position X basée sur l'offset horizontal
  const xPosition = horizontalOffset;
  
  return { y: `${yPosition}%`, x: `${xPosition}%` };
};

const SunriseAnimation = forwardRef<SunriseAnimationRef, SunriseAnimationProps>(
  ({ isVisible }, ref) => {
    // Références pour les éléments DOM
    const containerRef = useRef<HTMLDivElement>(null);
    const sunWrapperRef = useRef<HTMLDivElement>(null);
    const sunGlowRef = useRef<HTMLDivElement>(null);
    const lensFlareRef = useRef<HTMLDivElement>(null);
    const sunImageRef = useRef<HTMLImageElement>(null);

    // Référence pour la timeline GSAP
    const timelineRef = useRef<gsap.core.Timeline | null>(null);

    // 🌟 CISCO: Références pour animations continues (lens-flare + halo)
    const continuousAnimationsRef = useRef<gsap.core.Timeline[]>([]);

    // 🔧 CISCO: FONCTION UTILITAIRE - Calculer l'intensité du halo selon la hauteur
    const calculateGlowIntensity = (angle: number): number => {
      // Plus le soleil est haut, moins le halo est intense
      // Angle -25° (nuit) = halo 0, Angle 25° (lever/coucher) = halo max 1.3, Angle 90° (zénith) = halo min 0.3
      if (angle <= 0) return 0; // Sous l'horizon = pas de halo
      if (angle <= 25) return 1.3; // Lever/coucher = halo maximum
      if (angle >= 90) return 0.3; // Zénith = halo minimum

      // Interpolation linéaire entre 25° et 90°
      const ratio = (angle - 25) / (90 - 25); // 0 à 1
      return 1.3 - (ratio * 1.0); // 1.3 → 0.3
    };

    // 🔧 CISCO: FONCTION UTILITAIRE - Calculer l'intensité des rayons selon la hauteur (SPÉCIFICATIONS EXACTES)
    const calculateFlareIntensity = (angle: number): number => {
      // Plus le soleil est haut, moins les rayons sont visibles
      // CISCO: SPÉCIFICATIONS - Matin/Après-midi 103.5° = lens-flare 0.05 exact
      if (angle <= 0) return 0; // Sous l'horizon = pas de rayons
      if (angle <= 25) return 0.6; // Lever/coucher = rayons maximum
      if (angle >= 103.5) return 0.05; // CISCO: Matin 9h + Après-midi 15h = 0.05 exact

      // Interpolation linéaire entre 25° et 103.5°
      const ratio = (angle - 25) / (103.5 - 25); // 0 à 1
      return 0.6 - (ratio * 0.55); // CISCO: 0.6 → 0.05
    };

    // 🌟 CISCO: NOUVELLE FONCTION - Arrêter toutes les animations continues
    const stopContinuousAnimations = () => {
      continuousAnimationsRef.current.forEach(animation => {
        if (animation) animation.kill();
      });
      continuousAnimationsRef.current = [];
    };

    // 🌟 CISCO: NOUVELLE FONCTION - Autorotation subtile du lens-flare
    const startLensFlareRotation = (intensity: number) => {
      if (!lensFlareRef.current) return;

      // Arrêter les animations précédentes
      stopContinuousAnimations();

      // Vitesse de rotation basée sur l'intensité (plus intense = plus lent pour plus de majesté)
      const rotationSpeed = intensity > 0.5 ? 120 : 80; // 120s pour forte intensité, 80s pour faible

      console.log(`🌟 Démarrage autorotation lens-flare - Intensité: ${intensity.toFixed(2)}, Vitesse: ${rotationSpeed}s`);

      const rotationAnimation = gsap.to(lensFlareRef.current, {
        rotation: 360,
        duration: rotationSpeed,
        ease: "none",
        repeat: -1
      });

      continuousAnimationsRef.current.push(rotationAnimation);
    };

    // 🌟 CISCO: NOUVELLE FONCTION - Animation pulsation subtile du halo
    const startHaloPulsation = (baseIntensity: number) => {
      if (!sunGlowRef.current) return;

      // Amplitude de pulsation basée sur l'intensité de base
      const minScale = 0.8 + (baseIntensity * 0.6);
      const maxScale = minScale + 0.15; // Pulsation subtile de 15%
      const pulseDuration = 8.0; // 8 secondes pour une pulsation très douce

      console.log(`💫 Démarrage pulsation halo - Base: ${baseIntensity.toFixed(2)}, Scale: ${minScale.toFixed(2)}-${maxScale.toFixed(2)}`);

      const pulsationAnimation = gsap.timeline({ repeat: -1, yoyo: true });

      pulsationAnimation.to(sunGlowRef.current, {
        scale: maxScale,
        duration: pulseDuration,
        ease: "power1.inOut"
      });

      continuousAnimationsRef.current.push(pulsationAnimation);
    };

    // 🔧 CISCO: FONCTION UTILITAIRE - Animer le soleil vers une position
    const animateSunToPosition = (
      targetPosition: keyof typeof SUN_POSITIONS,
      duration: number = 15.0,
      customGlowIntensity?: number,
      customFlareIntensity?: number
    ) => {
      if (!sunWrapperRef.current || !sunGlowRef.current || !lensFlareRef.current) {
        console.warn(`☀️ Éléments DOM non prêts pour l'animation ${targetPosition}`);
        return;
      }

      // Calculer l'intensité du halo et des rayons selon la hauteur du soleil
      const angle = SUN_POSITIONS[targetPosition].angle;
      const glowIntensity = customGlowIntensity ?? calculateGlowIntensity(angle);
      const flareIntensity = customFlareIntensity ?? calculateFlareIntensity(angle);

      console.log(`☀️ Animation vers ${targetPosition} - Angle: ${angle}°, Offset: ${SUN_POSITIONS[targetPosition].horizontalOffset}%, Halo: ${glowIntensity.toFixed(2)}, Rayons: ${flareIntensity.toFixed(2)}`);

      // Nettoyer l'animation précédente
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // 🌟 CISCO: Arrêter les animations continues précédentes
      stopContinuousAnimations();

      // Créer une nouvelle timeline
      timelineRef.current = gsap.timeline({
        onComplete: () => {
          console.log(`✨ Animation ${targetPosition} terminée - Position finale: ${angle}°, Halo final: ${glowIntensity.toFixed(2)}, Rayons finaux: ${flareIntensity.toFixed(2)}`);

          // 🌟 CISCO: Démarrer animations continues pour positions avec soleil visible
          if (['morning', 'midday', 'afternoon'].includes(targetPosition) && flareIntensity > 0) {
            console.log(`🌟 Démarrage animations continues pour ${targetPosition}`);
            startLensFlareRotation(flareIntensity);
            startHaloPulsation(glowIntensity);
          }
        }
      });

      // Calculer la position cible
      const targetPos = angleToPosition(angle, SUN_POSITIONS[targetPosition].horizontalOffset);

      console.log(`🎯 Position cible calculée: y=${targetPos.y}, x=${targetPos.x}, Halo adaptatif: ${glowIntensity.toFixed(2)}, Rayons adaptatifs: ${flareIntensity.toFixed(2)}`);

      // PHASE 1: Mouvement du soleil avec courbe parabolique
      timelineRef.current.to(
        sunWrapperRef.current,
        {
          y: targetPos.y,
          x: targetPos.x,
          duration: duration,
          ease: 'power2.inOut' // Courbe naturelle
        },
        0
      );

      // PHASE 2: Animation de la lueur synchronisée
      timelineRef.current.to(
        sunGlowRef.current,
        {
          opacity: glowIntensity,
          scale: 0.8 + (glowIntensity * 0.6), // Scale basé sur l'intensité
          duration: duration * 0.8,
          ease: 'power2.out'
        },
        duration * 0.1 // Démarre après 10% de la durée
      );

      // PHASE 3: Animation du lens flare
      timelineRef.current.to(
        lensFlareRef.current,
        {
          opacity: flareIntensity,
          duration: duration * 0.6,
          ease: 'power2.out'
        },
        duration * 0.2 // Démarre après 20% de la durée
      );
    };

    // 🌅 CISCO: Animation AUBE - Soleil sous l'horizon (-15°)
    const triggerDawn = () => {
      animateSunToPosition('dawn', 15.0, 0, 0); // Pas de halo ni rayons sous l'horizon
    };

    // 🌅 CISCO: Animation LEVER DE SOLEIL - 25° au-dessus horizon
    const triggerSunrise = () => {
      animateSunToPosition('sunrise', 15.0, undefined, undefined); // Halo et rayons automatiques (1.3, 1.0)
    };

    // 🌄 CISCO: Animation MATIN - Y=-115%, X=-40%, lens-flare=0.03 (spécifications exactes)
    const triggerMorning = () => {
      animateSunToPosition('morning', 26.0, undefined, undefined); // CISCO: 26s pour la distance Y=-115%
    };

    // ☀️ CISCO: Animation MIDI/ZÉNITH - 90° tout en haut
    const triggerMidday = () => {
      animateSunToPosition('midday', 15.0, undefined, undefined); // Halo et rayons automatiques (0.3, 0.1)
    };

    // 🌇 CISCO: Animation APRÈS-MIDI - Même position que matin (symétrie parfaite)
    const triggerAfternoon = () => {
      animateSunToPosition('afternoon', 26.0, undefined, undefined); // CISCO: 26s comme matin, lens-flare 0.05
    };

    // 🌅 CISCO: Animation COUCHER DE SOLEIL - Descente progressive et naturelle
    const triggerSunset = () => {
      animateSunToPosition('sunset', 22.0, undefined, undefined); // CISCO: 22s pour descente progressive (plus naturel)
    };

    // 🌆 CISCO: Animation CRÉPUSCULE - Soleil sous l'horizon (-20°)
    const triggerDusk = () => {
      animateSunToPosition('dusk', 15.0, 0, 0); // Pas de halo ni rayons sous l'horizon
    };

    // 🌌 CISCO: Animation NUIT PROFONDE - Soleil très bas (-25°)
    const triggerNight = () => {
      animateSunToPosition('night', 15.0, 0, 0); // Pas de halo ni rayons sous l'horizon
    };

    // 🔄 CISCO: Remettre le soleil en position initiale
    const resetSun = () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }

      // 🌟 CISCO: Arrêter toutes les animations continues
      stopContinuousAnimations();

      if (sunWrapperRef.current && sunGlowRef.current && lensFlareRef.current) {
        const initialPos = angleToPosition(SUN_POSITIONS.dawn.angle, SUN_POSITIONS.dawn.horizontalOffset);

        gsap.set(sunWrapperRef.current, {
          y: initialPos.y,
          x: initialPos.x,
          opacity: 1
        });
        gsap.set(sunGlowRef.current, {
          opacity: 0,
          scale: 0.8
        });
        gsap.set(lensFlareRef.current, {
          opacity: 0,
          rotation: 0
        });
      }

      console.log('🔄 Soleil remis en position initiale (aube)');
    };

    // Exposer les méthodes via useImperativeHandle
    useImperativeHandle(ref, () => ({
      triggerSunrise,
      triggerMorning,
      triggerMidday,
      triggerAfternoon,
      triggerSunset,
      triggerDawn,
      triggerDusk,
      triggerNight,
      resetSun
    }));

    // Cleanup à la destruction du composant
    useLayoutEffect(() => {
      return () => {
        if (timelineRef.current) {
          timelineRef.current.kill();
        }
        // 🌟 CISCO: Nettoyer les animations continues
        stopContinuousAnimations();
      };
    }, []);

    // Ne pas rendre si non visible
    if (!isVisible) {
      return null;
    }

    return (
      <div
        ref={containerRef}
        className="fixed inset-0 w-full h-full pointer-events-none"
        style={{ zIndex: 1.8 }}
      >
        {/* Conteneur pour le soleil et ses effets */}
        <div
          ref={sunWrapperRef}
          className="absolute w-52 h-52 left-1/2 top-1/2 -translate-x-1/2"
          style={{
            transform: 'translateX(-50%) translateY(16.67%)', // Position initiale aube (-15°)
          }}
        >
          <div className="relative w-full h-full">
            {/* EFFET 1: Lueur subtile du soleil */}
            <div
              ref={sunGlowRef}
              className="sun-glow absolute inset-0 opacity-0"
            />
            
            {/* EFFET 2: Soleil principal */}
            <img
              ref={sunImageRef}
              src="/SUN.png"
              alt="Soleil"
              className="w-full h-full object-contain"
              style={{
                filter: 'brightness(1.1) saturate(1.1)',
                zIndex: 10
              }}
            />

            {/* EFFET 3: Lens Flare */}
            <div
              ref={lensFlareRef}
              className="absolute opacity-0 pointer-events-none"
              style={{
                width: '600px',
                height: 'auto',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                transformOrigin: 'center center',
                zIndex: 15
              }}
            >
              <img
                src="/lens-flare-light-3508x2540.png"
                alt="Lens Flare"
                className="w-full h-auto"
                style={{
                  mixBlendMode: 'screen'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
);

SunriseAnimation.displayName = 'SunriseAnimation';

export default SunriseAnimation;
