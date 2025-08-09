import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// 🔧 CISCO: Interface pour un nuage - NOUVELLE COLLECTION HAUTE QUALITÉ
interface Cloud {
  id: number;
  x: number; // Position X initiale (pour être visible immédiatement)
  y: number; // Position Y aléatoire
  size: number; // Taille du nuage
  duration: number; // Durée de l'animation (vitesse)
  cloudNumber: number; // Numéro du nuage dans la nouvelle collection (48-70)
  verticalDrift: number; // Dérive verticale naturelle
  opacity: number; // Opacité variable
  zIndex: number; // Profondeur pour effet de parallaxe
}

// Interface pour les props du composant
interface DiurnalLayerProps {
  skyMode: string;
}

// 🔧 CISCO: SYSTÈME DE TEINTES PROGRESSIVES POUR NUAGES - Mode Nuit Spécialisé
const getCloudTintForMode = (mode: string): string => {
  switch (mode) {
    case 'night':
      // 🌙 CISCO: Nuages assombris mais visibles pour la lune
      return 'brightness(0.4) saturate(0.7) contrast(1.1) hue-rotate(-10deg)';

    case 'dusk':
      // 🌆 Transition vers la nuit - nuages légèrement assombris
      return 'brightness(0.7) saturate(0.9) contrast(1.05) hue-rotate(-5deg)';

    case 'dawn':
      // 🌅 Nuages dorés de l'aube
      return 'brightness(1.1) saturate(1.2) contrast(1.0) hue-rotate(5deg)';

    case 'sunrise':
      // 🌄 Nuages orangés du lever de soleil
      return 'brightness(1.0) saturate(1.3) contrast(1.1) hue-rotate(15deg)';

    case 'sunset':
      // 🌇 Nuages dorés/orangés du coucher
      return 'brightness(1.0) saturate(1.3) contrast(1.1) hue-rotate(15deg)';

    default:
      // 🔧 CISCO: Nuages naturels pour tous les autres modes (matin, midi, après-midi)
      return 'brightness(1.0) saturate(1.0) contrast(1.0)';
  }
};


const DiurnalLayer: React.FC<DiurnalLayerProps> = ({ skyMode }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // 🔧 CISCO: Fonction pour générer les nuages - NOUVELLE COLLECTION HAUTE QUALITÉ
  const generateClouds = (): Cloud[] => {
    const clouds: Cloud[] = [];
    const cloudCount = 20; // 🔧 CISCO: Optimisation - 20 nuages haute qualité (collection complète)

    // 🔧 CISCO: Collection corrigée - Nuages existants uniquement (48, 50-70)
    const availableCloudNumbers = [48, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]; // 22 nuages disponibles

    // 🔧 CISCO: CORRECTION CRITIQUE - Copie de la liste pour éviter les duplications
    const remainingCloudNumbers = [...availableCloudNumbers];

    for (let i = 0; i < cloudCount; i++) {
      // 🔧 CISCO: CORRECTION - Sélection UNIQUE sans duplication
      if (remainingCloudNumbers.length === 0) {
        console.warn('⚠️ Plus de nuages uniques disponibles, arrêt de la génération');
        break;
      }

      const randomIndex = Math.floor(Math.random() * remainingCloudNumbers.length);
      const cloudNumber = remainingCloudNumbers[randomIndex];

      // 🔧 CISCO: RETIRER le nuage sélectionné pour éviter les duplications
      remainingCloudNumbers.splice(randomIndex, 1);

      console.log(`☁️ Nuage unique sélectionné: cloud_${cloudNumber}.png (${remainingCloudNumbers.length} restants)`);

      // 🔧 CISCO: Tailles optimisées pour nuages haute qualité
      const sizeCategory = Math.random();
      let cloudSize;
      if (sizeCategory < 0.6) {
        // 60% de nuages moyens
        cloudSize = 1.2 + Math.random() * 0.8; // 1.2x à 2.0x
      } else {
        // 40% de grands nuages
        cloudSize = 2.0 + Math.random() * 1.5; // 2.0x à 3.5x
      }

      // 🔧 CISCO: Vitesse ENCORE PLUS RALENTIE pour mouvement naturel et contemplatif
      const duration = 1200; // Vitesse TRÈS RALENTIE de 1200 secondes (20 minutes) pour tous les nuages

      // 🔧 PHYSIQUE: Dérive verticale ultra variée
      const verticalDrift = (Math.random() - 0.5) * 30; // ±15% de dérive verticale

      // 🔧 CISCO: Opacité fixée à 100% - AUCUN nuage semi-transparent
      const opacity = 1.0; // 100% opaque - TOUJOURS visible

      // 🔧 CISCO: Profondeur selon hiérarchie - Nuages derrière le paysage (z-index 9)
      const zIndex = 9; // Tous les nuages au même niveau, derrière le paysage

      clouds.push({
        id: i,
        x: -30 - Math.random() * 20, // 🔧 CISCO: TOUS les nuages commencent hors écran à GAUCHE (-30% à -50%) - pas d'apparition "par enchantement"
        y: 3 + Math.random() * 47, // 🔧 CISCO: Position Y uniquement dans la moitié HAUTE (3% à 50%) - pas besoin en bas à cause du paysage
        size: cloudSize,
        duration: duration,
        cloudNumber: cloudNumber, // 🔧 CISCO: Nouveau - numéro du nuage dans la collection
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

    // 🔧 CISCO: VÉRIFICATION - Aucune duplication de nuages
    const cloudNumbers = clouds.map(cloud => cloud.cloudNumber);
    const uniqueCloudNumbers = [...new Set(cloudNumbers)];

    // Vérification silencieuse des duplications
    if (cloudNumbers.length !== uniqueCloudNumbers.length) {
      console.error(`❌ DUPLICATION NUAGES DÉTECTÉE! ${cloudNumbers.length - uniqueCloudNumbers.length} doublons`);
    }

    return clouds;
  };

  // Initialiser les nuages - VERSION SIMPLIFIÉE
  useEffect(() => {
    if (!containerRef.current) return;

    // CISCO: Éviter la duplication - vérifier si déjà initialisé
    if (containerRef.current.children.length > 0) {
      return;
    }

    // Génération des nuages uniques
    const clouds = generateClouds();

    // Nettoyer le conteneur existant
    containerRef.current.innerHTML = '';

    clouds.forEach((cloud) => {
      // 🔧 CISCO: Nouvelle collection haute qualité - Sélection par numéro
      const imageSrc = `/Clouds/cloud_${cloud.cloudNumber}.png`;

      // Chargement nuage haute qualité

      // 🔧 CISCO: Chargement robuste avec vérification préalable
      const img = new Image();

      img.onload = () => {
        // Image chargée avec succès, créer l'élément nuage
        const cloudElement = document.createElement('div');
        cloudElement.className = 'cloud';
        cloudElement.setAttribute('data-cloud-element', 'true');

        const animationOffset = Math.random();
        const initialTint = getCloudTintForMode(skyMode);

        cloudElement.style.cssText = `
          position: absolute;
          left: ${cloud.x}%;
          top: ${cloud.y}%;
          --cloud-scale: ${cloud.size};
          --vertical-drift: ${cloud.verticalDrift}%;
          --start-x: ${cloud.x - 50}vw;
          --animation-offset: ${animationOffset};
          pointer-events: none;
          z-index: ${cloud.zIndex};
          transform: translateX(-50%) translateY(-50%) scale(var(--cloud-scale));
          animation: cloud-drift-realistic ${cloud.duration}s linear infinite;
          animation-delay: ${-cloud.duration * animationOffset}s;
          opacity: ${cloud.opacity};
          will-change: transform;
        `;

        const imgElement = document.createElement('img');
        imgElement.src = imageSrc;
        imgElement.alt = `Nuage ${cloud.cloudNumber}`;

        const imageSize = Math.floor(80 + cloud.size * 50);
        imgElement.style.cssText = `
          width: ${imageSize}px;
          height: auto;
          filter: ${initialTint};
          user-select: none;
          will-change: filter;
          transform: translateZ(0);
          backface-visibility: hidden;
        `;

        cloudElement.appendChild(imgElement);
        containerRef.current?.appendChild(cloudElement);
        // Nuage chargé avec succès
      };

      img.onerror = () => {
        console.error(`❌ Erreur chargement nuage: ${imageSrc}`);
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
      data-diurnal-layer="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{
        zIndex: 9 // 🔧 CISCO: Nuages derrière le paysage (z-index 9)
      }}
    />
  );
};

export default DiurnalLayer;
