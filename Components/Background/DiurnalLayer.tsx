import React, { useEffect, useRef } from 'react';

// Interface pour un nuage - VERSION PHYSIQUE AMÉLIORÉE
interface Cloud {
  id: number;
  x: number; // Position X initiale (pour être visible immédiatement)
  y: number; // Position Y aléatoire
  size: number; // Taille du nuage
  duration: number; // Durée de l'animation (vitesse)
  type: 'dust' | 'cloud-01' | 'cloud-02' | 'smoke';
  verticalDrift: number; // Dérive verticale naturelle
  opacity: number; // Opacité variable
  zIndex: number; // Profondeur pour effet de parallaxe
}

// Interface pour les props du composant
interface DiurnalLayerProps {
  skyMode: string;
}

// 🔧 FONCTION SIMPLIFIÉE: Calculer les effets sur les nuages (optimisés)
const getCloudTintForMode = (mode: string): string => {
  switch (mode) {
    case 'midday': return 'brightness(1.3) saturate(0.8) contrast(0.95) hue-rotate(0deg)'; // CISCO: Nuages très blancs/lumineux
    case 'morning': return 'brightness(1.1) saturate(1.0) contrast(1.05)';
    case 'afternoon': return 'brightness(1.1) saturate(1.0) contrast(1.05)';
    case 'dawn': return 'brightness(0.8) contrast(1.1) saturate(1.1) hue-rotate(5deg)';
    case 'sunrise': return 'brightness(0.9) contrast(1.1) saturate(1.2) hue-rotate(8deg)';
    case 'sunset': return 'brightness(1.0) contrast(1.1) saturate(1.3) hue-rotate(15deg)'; // CISCO: Nuages dorés/orangés, pas noirs
    case 'dusk': return 'brightness(0.6) contrast(1.15) saturate(1.2) hue-rotate(8deg)';
    case 'night': return 'brightness(0.3) contrast(1.2) saturate(0.7) hue-rotate(-10deg)';
    default: return 'brightness(1.0) saturate(1.0) contrast(1.0)';
  }
};


const DiurnalLayer: React.FC<DiurnalLayerProps> = ({ skyMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Fonction pour générer les nuages avec physique améliorée - VERSION ULTRA ALÉATOIRE
  const generateClouds = (): Cloud[] => {
    const clouds: Cloud[] = [];
    const cloudCount = 32; // 🔧 AUGMENTATION: Encore plus de nuages pour un ciel plus rempli
    const types: ('dust' | 'cloud-01' | 'cloud-02' | 'smoke')[] = ['dust', 'cloud-01', 'cloud-02', 'smoke'];

    for (let i = 0; i < cloudCount; i++) {
      // 🔧 RANDOMISATION ULTRA COMPLÈTE: Type aléatoire à chaque fois
      const randomTypeIndex = Math.floor(Math.random() * types.length);
      const cloudType = types[randomTypeIndex];

      // 🔧 PHYSIQUE: Tailles retravaillées - SEULEMENT moyens et grands nuages
      const sizeCategory = Math.random();
      let cloudSize;
      if (sizeCategory < 0.6) {
        // 60% de nuages moyens
        cloudSize = 1.2 + Math.random() * 0.8; // 1.2x à 2.0x
      } else {
        // 40% de grands nuages
        cloudSize = 2.0 + Math.random() * 1.5; // 2.0x à 3.5x
      }

      // 🔧 PHYSIQUE: Vitesse ralentie pour un rendu plus réaliste (moins de tempête)
      const baseSpeed = 300 + Math.random() * 400; // Entre 300 et 700 secondes (plus lent)
      const sizeSpeedFactor = cloudSize > 1.5 ? 1.8 : (cloudSize < 0.6 ? 0.7 : 1.0); // Facteurs réduits
      const duration = baseSpeed * sizeSpeedFactor + Math.random() * 300; // Variation réduite

      // 🔧 PHYSIQUE: Dérive verticale ultra variée
      const verticalDrift = (Math.random() - 0.5) * 30; // ±15% de dérive verticale

      // 🔧 CISCO: Opacité fixée à 100% - AUCUN nuage semi-transparent
      const opacity = 1.0; // 100% opaque - TOUJOURS visible

      // 🔧 PHYSIQUE: Profondeur aléatoire pour parallaxe
      const zIndex = Math.random() > 0.4 ? 12 : 10; // 60% en premier plan

      clouds.push({
        id: i,
        x: Math.random() * 140 - 20, // 🔧 CORRECTION: Position aléatoire sur toute la largeur (-20% à 120%)
        y: 3 + Math.random() * 85, // Position Y ultra variée (3% à 88%)
        size: cloudSize,
        duration: duration,
        type: cloudType,
        verticalDrift: verticalDrift,
        opacity: opacity,
        zIndex: zIndex
      });
    }

    // Triple mélange pour dispersion parfaite
    for (let shuffle = 0; shuffle < 3; shuffle++) {
      for (let i = clouds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clouds[i], clouds[j]] = [clouds[j], clouds[i]];
      }
    }

    return clouds;
  };

  // Initialiser les nuages - VERSION SIMPLIFIÉE
  useEffect(() => {
    if (!containerRef.current) return;

    const clouds = generateClouds();

    // Nettoyer le conteneur existant
    containerRef.current.innerHTML = '';

    clouds.forEach((cloud) => {
      // Choisir l'image selon le type
      let imageSrc: string;
      switch (cloud.type) {
        case 'dust':
          imageSrc = '/Cloud_white-dust-64.png';
          break;
        case 'cloud-01':
          imageSrc = '/Cloud-01.png';
          break;
        case 'cloud-02':
          imageSrc = '/cloud-02.png';
          break;
        case 'smoke':
          imageSrc = '/smoke-cloud-93.png';
          break;
        default:
          imageSrc = '/Cloud_white-dust-64.png';
      }

      // Vérifier que l'image existe
      const img = new Image();
      img.onload = () => {
        // Image chargée avec succès, créer l'élément nuage
        const cloudElement = document.createElement('div');
        cloudElement.className = 'cloud';

        // 🔧 CISCO: Suppression des délais d'apparition - nuages omniprésents dès le chargement
        let randomDelay = 0; // Tous les nuages commencent immédiatement

        // 🔧 CISCO: Dispersion des positions initiales pour éviter l'effet de groupe
        // Les nuages commencent à des positions différentes dans leur cycle d'animation
        const animationOffset = Math.random(); // 0 à 1 pour répartir sur tout le cycle

        // 🔧 MODE MANUEL: Teinte neutre par défaut avec variation selon le type
        let initialTint;
        switch (cloud.type) {
          case 'dust':
            initialTint = 'brightness(1.0) saturate(0.9) contrast(1.05)'; // Légèrement désaturé
            break;
          case 'smoke':
            initialTint = 'brightness(0.95) saturate(0.8) contrast(1.1)'; // Plus foncé et contrasté
            break;
          case 'cloud-01':
          case 'cloud-02':
          default:
            initialTint = 'brightness(1.0) saturate(1.0) contrast(1.0)'; // Neutre
            break;
        }

        // 🔧 AJOUT: Attribut data pour identifier les nuages
        cloudElement.setAttribute('data-cloud-element', 'true');

        // 🔧 CISCO: Style CSS avec animation immédiate et répartition sur le cycle
        cloudElement.style.cssText = `
          position: absolute;
          left: ${cloud.x}%;
          top: ${cloud.y}%;
          --cloud-scale: ${cloud.size};
          --vertical-drift: ${cloud.verticalDrift}%;
          --start-x: ${cloud.x - 50}vw;
          --animation-offset: ${animationOffset}; /* Offset pour répartir les nuages sur le cycle */
          pointer-events: none;
          z-index: ${cloud.zIndex};
          transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale));
          animation: cloud-drift-realistic ${cloud.duration}s linear infinite ${randomDelay}s;
          animation-delay: ${-cloud.duration * animationOffset}s; /* Délai négatif pour commencer au milieu du cycle */
          opacity: ${cloud.opacity};
          will-change: transform;
        `;

        // Créer l'élément image avec taille variable
        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        imgElement.alt = `Nuage ${cloud.type}`;
        
        // 🔧 TAILLES RETRAVAILLÉES: Basées sur les nouvelles dimensions moyennes/grandes
        const imageSize = Math.floor(80 + cloud.size * 50); // Entre 80px et 255px (plus gros)
        
        imgElement.style.cssText = `
          width: ${imageSize}px;
          height: auto;
          filter: ${initialTint};
          user-select: none;
          transition: filter 2s ease-in-out;
          will-change: filter;
        `;

        cloudElement.appendChild(imgElement);
        containerRef.current?.appendChild(cloudElement);
      };

      img.onerror = () => {
        console.warn(`🌤️ Image non trouvée: ${imageSrc}`);
      };

      img.src = imageSrc;
    });

    // Ajouter l'animation CSS avec physique réaliste
    if (!document.querySelector('#cloud-animation-style')) {
      const style = document.createElement('style');
      style.id = 'cloud-animation-style';
      style.textContent = `
        @keyframes cloud-drift-realistic {
          0% {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(var(--start-x)) translateY(0);
          }
          20% {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(calc(var(--start-x) + 40vw)) translateY(calc(var(--vertical-drift) * 0.2));
          }
          40% {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(calc(var(--start-x) + 70vw)) translateY(calc(var(--vertical-drift) * 0.5));
          }
          60% {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(calc(var(--start-x) + 100vw)) translateY(calc(var(--vertical-drift) * 0.7));
          }
          80% {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(calc(var(--start-x) + 130vw)) translateY(calc(var(--vertical-drift) * 0.9));
          }
          100% {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(calc(var(--start-x) + 170vw)) translateY(var(--vertical-drift));
          }
        }
        
        .cloud {
          will-change: transform;
        }

        /* Animation alternative pour nuages plus lents (effet de profondeur) */
        @keyframes cloud-drift-slow {
          from {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(-40vw);
          }
          to {
            transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale)) translateX(150vw);
          }
        }
      `;
      document.head.appendChild(style);
    }

    return () => {
      const style = document.querySelector('#cloud-animation-style');
      if (style && style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };
  }, []);

  // 🔧 NOUVEAU: Réagir aux changements de mode pour teinter les nuages
  useEffect(() => {
      if (!containerRef.current) return;

      const cloudTint = getCloudTintForMode(skyMode);
      const cloudElements = containerRef.current.querySelectorAll('[data-cloud-element]');

      console.log(`🌤️ Application de la teinte pour le mode ${skyMode}: ${cloudTint}`);

      cloudElements.forEach((cloudElement) => {
          const img = cloudElement.querySelector('img');
          if (img) {
              gsap.to(img, {
                  filter: cloudTint,
                  duration: 15.0, // Durée synchronisée avec le fond
                  ease: "power1.inOut",
              });
          }
      });
  }, [skyMode]);


  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 2
      }}
    />
  );
};

export default DiurnalLayer;
