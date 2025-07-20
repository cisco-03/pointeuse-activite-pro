import React, { useState } from 'react';

const BackgroundInfo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-teal-600/80 hover:bg-teal-700/80 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-40 shadow-lg"
        title="Informations sur l'arrière-plan dynamique"
      >
        🌅
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm z-40 max-w-sm shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-teal-400">🌌 Ciel Dynamique</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="text-sm space-y-2 text-gray-300">
        <p>
          Le ciel change automatiquement selon l'heure de votre PC,
          simulant le cycle naturel jour/nuit avec étoiles et lune réalistes :
        </p>

        <ul className="space-y-1 text-xs">
          <li>🌙 <strong>0h-5h :</strong> Nuit profonde + 400 étoiles</li>
          <li>🌅 <strong>5h-8h :</strong> Aube (étoiles disparaissent)</li>
          <li>☀️ <strong>8h-12h :</strong> Matin</li>
          <li>🌞 <strong>12h-15h :</strong> Midi</li>
          <li>🌤️ <strong>15h-18h :</strong> Après-midi</li>
          <li>🌇 <strong>18h-21h :</strong> Crépuscule (étoiles apparaissent)</li>
          <li>🌃 <strong>21h-24h :</strong> Soirée + lune</li>
        </ul>

        <div className="text-xs text-gray-400 mt-3 space-y-1">
          <p>✨ <strong>400 micro-étoiles</strong> scintillantes en temps réel</p>
          <p>🌙 <strong>Phases lunaires</strong> selon le vrai calendrier</p>
          <p>🎨 <strong>Transitions fluides</strong> toutes les secondes</p>
        </div>
      </div>
    </div>
  );
};

export default BackgroundInfo;
