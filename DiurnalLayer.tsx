import React, { useEffect, useRef } from 'react';

// Interface pour un nuage - VERSION CSS PURE
interface Cloud {
  id: number;
  x: number; // Position X initiale (pour être visible immédiatement)
  y: number; // Position Y aléatoire
  size: number; // Taille du nuage
  duration: number; // Durée de l'animation
  type: 'dust' | 'cloud-01' | 'cloud-02' | 'smoke';
}

// Interface pour les props du composant
interface DiurnalLayerProps {
  // Pas de props pour le moment
}

const DiurnalLayer: React.FC<DiurnalLayerProps> = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Générer les nuages - VERSION AVEC FORMES DIVERSES ET DISPERSION ALÉATOIRE
  const generateClouds = (): Cloud[] => {
    const clouds: Cloud[] = [];
    const cloudCount = 42; // Encore plus de nuages pour plus de diversité
    const types: ('dust' | 'cloud-01' | 'cloud-02' | 'smoke')[] = ['dust', 'cloud-01', 'cloud-02', 'smoke'];

    for (let i = 0; i < cloudCount; i++) {
      // Répartition équilibrée des types de nuages avec répétition pour plus de diversité
      const typeIndex = i % types.length;
      const cloudType = types[typeIndex];

      clouds.push({
        id: i,
        x: -30, // TOUS commencent hors écran à gauche (pas d'apparition magique)
        y: Math.random() * 90, // Position Y aléatoire de 0% à 90%
        size: 0.4 + Math.random() * 1.6, // Taille entre 0.4x et 2.0x (TRÈS grande diversité de formes)
        duration: 400 + Math.random() * 300, // Durée entre 400s et 700s (7 à 12 minutes - très paisible)
        type: cloudType
      });
    }

    // Triple mélange pour une dispersion parfaitement aléatoire
    for (let shuffle = 0; shuffle < 3; shuffle++) {
      for (let i = clouds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clouds[i], clouds[j]] = [clouds[j], clouds[i]];
      }
    }

    return clouds;
  };





  // Initialiser les nuages - VERSION CORRIGÉE
  useEffect(() => {
    if (!containerRef.current) return;

    // Ajouter le style CSS pour l'animation directement dans le head
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      @keyframes moveCloudSlow {
        0% {
          transform: translateX(-30vw) scale(var(--cloud-scale));
          opacity: 1;
        }
        100% {
          transform: translateX(130vw) scale(var(--cloud-scale));
          opacity: 1;
        }
      }
    `;
    document.head.appendChild(styleElement);

    const clouds = generateClouds();

    // Créer les éléments DOM pour les nuages
    clouds.forEach((cloud, index) => {
      const cloudElement = document.createElement('div');

      // Déterminer l'image du nuage selon le type
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

      // Dispersion temporelle MAXIMALE pour éviter les groupes
      const randomDelay = Math.random() * cloud.duration * 1.5; // Délai encore plus grand pour plus de dispersion

      // Style CSS complet pour le nuage - DISPERSION PARFAITE
      cloudElement.style.cssText = `
        position: absolute;
        left: ${cloud.x}%;
        top: ${cloud.y}%;
        --cloud-scale: ${cloud.size};
        pointer-events: none;
        z-index: 1;
        animation: moveCloudSlow ${cloud.duration}s linear infinite;
        animation-delay: -${randomDelay}s;
        transform-origin: center center;
        opacity: 1;
      `;

      cloudElement.innerHTML = `
        <img
          src="${imageSrc}"
          alt="nuage"
          style="
            width: auto;
            height: 80px;
            opacity: 1.0;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
            display: block;
          "
          onload="console.log('✅ Nuage ${index + 1} chargé - X: ${cloud.x.toFixed(1)}%, Y: ${cloud.y.toFixed(1)}%')"
          onerror="console.error('❌ Erreur nuage:', '${imageSrc}')"
        />
      `;

      containerRef.current?.appendChild(cloudElement);
      console.log(`☁️ Nuage ${index + 1}/${clouds.length} créé - X: ${cloud.x.toFixed(1)}%, Y: ${cloud.y.toFixed(1)}%`);
    });

    // Nettoyage au démontage
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      // Supprimer le style ajouté
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2 }}
    />
  );
};

export default DiurnalLayer;
