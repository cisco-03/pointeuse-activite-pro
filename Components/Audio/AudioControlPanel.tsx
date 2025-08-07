import React, { useState } from 'react';

// Types pour les langues et traductions
type Lang = 'fr' | 'en';

interface Translations {
  ambientAudio: string;
  ambientSounds: string;
  enabled: string;
  enable: string;
  volume: string;
  audioControlsTooltip: string;
  audioEnabledTooltip: string;
  audioDisabledTooltip: string;
  ambientSoundsAvailable: string;
  whyNotAutomatic: string;
  browserProtection: string;
  howToActivate: string;
  activateInstructions: string;
}

// Traductions
const translations: { [key in Lang]: Translations } = {
  fr: {
    ambientAudio: "Ambiance Audio",
    ambientSounds: "Sons d'ambiance :",
    enabled: "Activé",
    enable: "Activer",
    volume: "Volume :",
    audioControlsTooltip: "Contrôles audio d'ambiance",
    audioEnabledTooltip: "Contrôles audio d'ambiance (Activé)",
    audioDisabledTooltip: "Contrôles audio d'ambiance (Désactivé - Cliquez pour activer)",
    ambientSoundsAvailable: "Sons d'ambiance disponibles",
    whyNotAutomatic: "Pourquoi l'audio n'est pas automatique ?",
    browserProtection: "Les navigateurs modernes bloquent la lecture automatique de sons pour protéger votre expérience de navigation.",
    howToActivate: "Comment activer :",
    activateInstructions: "Cliquez simplement sur \"Activer\" ci-dessous pour profiter des sons d'ambiance qui s'adaptent automatiquement au cycle jour/nuit de votre arrière-plan.",
  },
  en: {
    ambientAudio: "Ambient Audio",
    ambientSounds: "Ambient sounds:",
    enabled: "Enabled",
    enable: "Enable",
    volume: "Volume:",
    audioControlsTooltip: "Ambient audio controls",
    audioEnabledTooltip: "Ambient audio controls (Enabled)",
    audioDisabledTooltip: "Ambient audio controls (Disabled - Click to enable)",
    ambientSoundsAvailable: "Ambient sounds available",
    whyNotAutomatic: "Why isn't audio automatic?",
    browserProtection: "Modern browsers block automatic sound playback to protect your browsing experience.",
    howToActivate: "How to activate:",
    activateInstructions: "Simply click \"Enable\" below to enjoy ambient sounds that automatically adapt to your background's day/night cycle.",
  },
};

interface AudioControlPanelProps {
  onVolumeChange: (volume: number) => void;
  onToggleEnabled: (enabled: boolean) => void;
  enabled: boolean;
  volume: number;
  lang?: Lang;
}

const AudioControlPanel: React.FC<AudioControlPanelProps> = ({
  onVolumeChange,
  onToggleEnabled,
  enabled,
  volume,
  lang = 'fr'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const t = translations[lang];

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className={`p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-40 shadow-lg ${
          enabled
            ? 'bg-[#0D9488]/80 hover:bg-[#0D9488]/90 text-white'
            : 'bg-gray-600/80 hover:bg-gray-500/90 text-gray-300'
        }`}
        title={enabled ? t.audioEnabledTooltip : t.audioDisabledTooltip}
      >
        {enabled ? '🎵' : '🔇'}

        {/* Indicateur d'état */}
        {!enabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        )}
      </button>
    );
  }

  return (
    <div className="bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm z-40 max-w-sm shadow-xl border border-gray-700 fixed bottom-20 right-4">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-[#A550F5]">🎵 {t.ambientAudio}</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Message informatif si désactivé */}
        {!enabled && (
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-blue-400">🔊</span>
              <span className="font-medium text-blue-300">{t.ambientSoundsAvailable}</span>
            </div>
            <p className="text-blue-200 text-xs mb-2">
              <strong>{t.whyNotAutomatic}</strong><br/>
              {t.browserProtection}
            </p>
            <p className="text-blue-200 text-xs">
              <strong>{t.howToActivate}</strong> {t.activateInstructions}
            </p>
          </div>
        )}

        {/* Toggle principal */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{t.ambientSounds}</span>
          <button
            onClick={() => onToggleEnabled(!enabled)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              enabled
                ? 'bg-[#0D9488] text-white hover:bg-[#0D9488]/90'
                : 'bg-orange-600 text-white hover:bg-orange-500'
            }`}
          >
            {enabled ? t.enabled : t.enable}
          </button>
        </div>

        {/* Contrôle du volume */}
        {enabled && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">{t.volume}</span>
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
