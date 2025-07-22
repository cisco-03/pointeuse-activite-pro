import React, { useState } from 'react';

interface AudioControlPanelProps {
  onVolumeChange: (volume: number) => void;
  onToggleEnabled: (enabled: boolean) => void;
  enabled: boolean;
  volume: number;
}

const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  onVolumeChange,
  onToggleEnabled,
  enabled,
  volume
}) => {
  const [isVisible, setIsVisible] = useState(false);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="bg-[#0D9488]/80 hover:bg-[#0D9488]/90 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-40 shadow-lg"
        title="Contrôles audio d'ambiance"
      >
        🎵
        
        {/* Petit indicateur clignotant pour attirer l'attention */}
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#A550F5] rounded-full animate-ping"></div>
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#0D9488] rounded-full"></div>
      </button>
    );
  }

  return (
    <div className="bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm z-40 max-w-sm shadow-xl border border-gray-700 fixed bottom-20 right-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-[#A550F5]">🎵 Ambiance Audio</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Toggle principal */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sons d'ambiance :</span>
          <button
            onClick={() => onToggleEnabled(!enabled)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              enabled 
                ? 'bg-[#0D9488] text-white'
                : 'bg-gray-600 text-gray-300'
            }`}
          >
            {enabled ? 'Activé' : 'Désactivé'}
          </button>
        </div>

        {/* Contrôle du volume */}
        {enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Volume :</span>
              <span className="text-xs text-gray-400">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        )}

        {/* Information sur les sons - SUPPRIMÉ */}
      </div>

      {/* Styles CSS pour le slider */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .slider::-webkit-slider-thumb {
            appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #9333ea;
            cursor: pointer;
            box-shadow: 0 0 4px rgba(147, 51, 234, 0.5);
          }
          .slider::-moz-range-thumb {
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #9333ea;
            cursor: pointer;
            border: none;
            box-shadow: 0 0 4px rgba(147, 51, 234, 0.5);
          }
        `
      }} />
    </div>
  );
};

export default AudioControlPanel;
