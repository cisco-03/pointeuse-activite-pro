import React, { useState, useEffect } from 'react';
import { useLocation } from '../Context/LocationContext';
import * as SunCalc from 'suncalc';

// Types pour les langues et traductions
type Lang = 'fr' | 'en';

interface Translations {
  backgroundControl: string;
  simulatedTime: string;
  backgroundModes: string;
  hideControls: string;
  advancedControls: string;
  manualTime: string;
  refresh: string;
  refreshTooltip: string;
  backgroundControlTooltip: string;
  ambientControls: string;
  changeTimeAtmosphere: string;
  deepNight: string;
  dawn: string;
  sunrise: string;
  morning: string;
  middayZenith: string;
  afternoon: string;
  sunset: string;
  dusk: string;
}

// Traductions
const translations: { [key in Lang]: Translations } = {
  fr: {
    backgroundControl: "Contrôle Arrière-plan",
    simulatedTime: "Temps simulé:",
    backgroundModes: "Modes Arrière-plan:",
    hideControls: "Masquer contrôles",
    advancedControls: "Contrôles avancés",
    manualTime: "Heure manuelle:",
    refresh: "Actualiser",
    refreshTooltip: "Actualiser - Retour au temps réel et synchronisation de l'arrière-plan",
    backgroundControlTooltip: "Panneau de Contrôle Arrière-plan",
    ambientControls: "Contrôles d'Ambiance",
    changeTimeAtmosphere: "Changez l'heure et l'atmosphère",
    deepNight: "Nuit profonde",
    dawn: "Aube",
    sunrise: "Lever du soleil",
    morning: "Matin",
    middayZenith: "Midi (zénith)",
    afternoon: "Après-midi",
    sunset: "Coucher du soleil",
    dusk: "Crépuscule",
  },
  en: {
    backgroundControl: "Background Control",
    simulatedTime: "Simulated time:",
    backgroundModes: "Background Modes:",
    hideControls: "Hide controls",
    advancedControls: "Advanced controls",
    manualTime: "Manual time:",
    refresh: "Refresh",
    refreshTooltip: "Refresh - Return to real time and background synchronization",
    backgroundControlTooltip: "Background Control Panel",
    ambientControls: "Ambient Controls",
    changeTimeAtmosphere: "Change time and atmosphere",
    deepNight: "Deep night",
    dawn: "Dawn",
    sunrise: "Sunrise",
    morning: "Morning",
    middayZenith: "Midday (zenith)",
    afternoon: "Afternoon",
    sunset: "Sunset",
    dusk: "Dusk",
  },
};

// Type pour les modes de fond
type BackgroundMode = 
  | 'dawn'        // Aube
  | 'sunrise'     // Lever du soleil
  | 'morning'     // Matin
  | 'midday'      // Midi
  | 'afternoon'   // Après-midi
  | 'sunset'      // Coucher du soleil
  | 'dusk'        // Crépuscule
  | 'night';      // Nuit

interface TimeSimulatorProps {
  onTimeChange: (simulatedTime: Date) => void;
  currentSimulatedTime: Date;
  onSetMode: (mode: string) => void;
  onResetToAuto: () => void;
  lang?: Lang;
}

const TimeSimulator: React.FC<TimeSimulatorProps> = ({ onTimeChange, currentSimulatedTime, onSetMode, onResetToAuto, lang = 'fr' }) => {
  const t = translations[lang];
  const { userLocation, locationReady } = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // 🔧 CISCO: État pour le tooltip informatif

  // Obtenir les heures solaires pour aujourd'hui
  const getSunTimes = () => {
    if (!locationReady) return null;
    return SunCalc.getTimes(new Date(), userLocation.lat, userLocation.lon);
  };

  const sunTimes = getSunTimes();

  // 🔧 CISCO: Système de tooltip informatif qui apparaît périodiquement
  useEffect(() => {
    // Afficher le tooltip après 10 secondes, puis toutes les 2 minutes
    const showTooltipTimer = setTimeout(() => {
      setShowTooltip(true);

      // Masquer le tooltip après 5 secondes
      setTimeout(() => setShowTooltip(false), 5000);
    }, 10000);

    // Répéter toutes les 2 minutes si l'utilisateur n'a pas ouvert le panneau
    const intervalTimer = setInterval(() => {
      if (!isVisible) {
        setShowTooltip(true);
        setTimeout(() => setShowTooltip(false), 5000);
      }
    }, 120000); // 2 minutes

    return () => {
      clearTimeout(showTooltipTimer);
      clearInterval(intervalTimer);
    };
  }, [isVisible]);

  // Créer une date simulée avec l'heure spécifiée
  const createSimulatedTime = (hours: number, minutes: number = 0) => {
    const now = new Date();
    const simulated = new Date(now);
    simulated.setHours(hours, minutes, 0, 0);
    return simulated;
  };


  // Phases de test avec modes de fond correspondants
  const testPhases = [
    {
      name: `🌌 ${t.deepNight}`,
      mode: 'night' as BackgroundMode,
      time: createSimulatedTime(2, 0)
    },
    {
      name: `🌅 ${t.dawn}`,
      mode: 'dawn' as BackgroundMode,
      time: sunTimes ? sunTimes.dawn : createSimulatedTime(6, 0)
    },
    {
      name: `🌄 ${t.sunrise}`,
      mode: 'sunrise' as BackgroundMode,
      time: sunTimes ? sunTimes.sunrise : createSimulatedTime(7, 0)
    },
    {
      name: `🌞 ${t.morning}`,
      mode: 'morning' as BackgroundMode,
      time: createSimulatedTime(9, 0)
    },
    {
      name: `☀️ ${t.middayZenith}`,
      mode: 'midday' as BackgroundMode,
      time: createSimulatedTime(12, 0)
    },
    {
      name: `🌇 ${t.afternoon}`,
      mode: 'afternoon' as BackgroundMode,
      time: createSimulatedTime(15, 0)
    },
    {
      name: `🌆 ${t.sunset}`,
      mode: 'sunset' as BackgroundMode,
      time: sunTimes ? sunTimes.sunset : createSimulatedTime(18, 0)
    },
    {
      name: `🌃 ${t.dusk}`,
      mode: 'dusk' as BackgroundMode,
      time: sunTimes ? sunTimes.dusk : createSimulatedTime(19, 0)
    },
  ];

  // Contrôle manuel de l'heure
  const handleTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const [hours, minutes] = event.target.value.split(':').map(Number);
    const newTime = createSimulatedTime(hours, minutes);
    onTimeChange(newTime);
  };

  // Retour au temps réel avec calcul solaire basé sur la géolocalisation
  const resetToRealTime = () => {
    console.log('🔄 Actualisation vers le temps réel...');
    onTimeChange(new Date());
    onResetToAuto();
    console.log(`✅ Temps réel actualisé`);
  };

  // Formatage de l'heure pour l'affichage
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isVisible) {
    return (
      <div className="relative">
        <button
          onClick={() => {
            setIsVisible(true);
            setShowTooltip(false); // Masquer le tooltip quand on ouvre le panneau
          }}
          className="bg-[#0D9488]/80 hover:bg-[#0D9488]/90 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-40 shadow-lg"
          title={t.backgroundControlTooltip}
        >
          🎨

          {/* Indicateur clignotant pour attirer l'attention */}
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-600 rounded-full"></div>
        </button>

        {/* 🔧 CISCO: Tooltip informatif qui apparaît périodiquement - Position automatique */}
        {showTooltip && (
          <div className="absolute bottom-full left-0 mb-2 px-3 py-2 bg-black/90 text-white text-xs rounded-lg shadow-lg backdrop-blur-sm border border-[#A550F5]/30 whitespace-nowrap z-50 animate-pulse min-w-max">
            <div className="text-left">
              <div className="font-semibold text-[#A550F5]">🎨 {t.ambientControls}</div>
              <div className="text-gray-300">{t.changeTimeAtmosphere}</div>
            </div>
            {/* Petite flèche pointant vers le bouton - Positionnée à gauche */}
            <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-black/90"></div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 left-4 bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm z-40 w-80 shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-[#A550F5]">🎨 {t.backgroundControl}</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Affichage du temps actuel */}
      <div className="mb-3 p-2 bg-gray-800 rounded">
        <div className="text-xs text-gray-400">{t.simulatedTime}</div>
        <div className="text-lg font-mono text-[#A550F5]">{formatTime(currentSimulatedTime)}</div>
      </div>

      {/* Boutons de contrôle des modes */}
      <div className="mb-3">
        <div className="mb-2 text-xs font-semibold text-[#A550F5]">🌅 {t.backgroundModes}</div>
        <div className="grid grid-cols-2 gap-2">
          {testPhases.map((phase, index) => (
            <button
              key={index}
              onClick={() => {
                onSetMode(phase.mode);
                onTimeChange(phase.time);
              }}
              className="text-left bg-gradient-to-r from-[#0D9488] to-[#0D9488]/80 hover:from-[#A550F5] hover:to-[#A550F5]/80 px-3 py-3 rounded text-xs transition-all duration-300 shadow-md transform hover:scale-105"
              title={`Mode ${phase.name} à ${formatTime(phase.time)}`}
            >
              <div className="font-semibold text-sm">{phase.name}</div>
              <div className="text-gray-200 text-xs">{formatTime(phase.time)}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Contrôle manuel de l'heure - Section repliable */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-gray-700 hover:bg-gray-600 px-3 py-2 rounded text-sm transition-colors mb-3"
      >
        {isExpanded ? `🔼 ${t.hideControls}` : `🔽 ${t.advancedControls}`}
      </button>

      {/* Contrôles avancés */}
      {isExpanded && (
        <div className="border-t border-gray-600 pt-3">
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">{t.manualTime}</label>
            <div className="flex gap-2">
              <input
                type="time"
                value={`${currentSimulatedTime.getHours().toString().padStart(2, '0')}:${currentSimulatedTime.getMinutes().toString().padStart(2, '0')}`}
                onChange={handleTimeChange}
                className="bg-gray-700 text-white px-2 py-1 rounded text-sm flex-1"
              />
              <button
                onClick={resetToRealTime}
                className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors whitespace-nowrap"
                title={t.refreshTooltip}
              >
                🔄 {t.refresh}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Informations sur la position (optionnel) */}
      {isExpanded && locationReady && sunTimes && (
        <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
          <div>📍 Position: {userLocation.lat.toFixed(2)}, {userLocation.lon.toFixed(2)}</div>
          <div>🌅 Lever: {sunTimes.sunrise.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
          <div>🌇 Coucher: {sunTimes.sunset.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
        </div>
      )}
    </div>
  );
};

export default TimeSimulator;
