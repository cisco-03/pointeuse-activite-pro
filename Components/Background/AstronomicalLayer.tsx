import React, { useEffect, useRef } from 'react';
import FixedStars from './FixedStars';
import MoonAnimation from '../UI/MoonAnimation';

// Interface pour les props du composant
interface AstronomicalLayerProps {
  // Mode du ciel pour contrôler la visibilité des étoiles
  skyMode?: 'night' | 'dawn' | 'sunrise' | 'morning' | 'midday' | 'afternoon' | 'sunset' | 'dusk';
}

const AstronomicalLayer: React.FC<AstronomicalLayerProps> = ({ skyMode = 'night' }) => {
  const containerRef = useRef<HTMLDivElement>(null);








  // 🔧 CISCO: Suppression du double système d'étoiles - FixedStars s'occupe de tout
  useEffect(() => {
    console.log(`🌌 AstronomicalLayer: Mode ${skyMode} - Délégation à FixedStars`);
  }, [skyMode]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none"
      style={{
        zIndex: 7 // 🔧 CISCO: Étoiles derrière la lune (z-index 7)
      }}
    >
      {/* Étoiles fixes avec haute densité */}
      <FixedStars skyMode={skyMode} density="high" />

      {/* 🌙 CISCO: Lune intégrée dans la couche astronomique pour ordre DOM correct */}
      <MoonAnimation
        isNightMode={skyMode === 'night'}
        currentMode={skyMode}
      />
    </div>
  );
};

export default AstronomicalLayer;
