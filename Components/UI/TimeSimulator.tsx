import React, { useState, useEffect } from 'react';
import { useLocation } from '../Context/LocationContext';
import * as SunCalc from 'suncalc';

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
}

const TimeSimulator: React.FC<TimeSimulatorProps> = ({ onTimeChange, currentSimulatedTime }) => {
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

  // Fonction pour changer le mode de fond directement
  const setBackgroundMode = (mode: BackgroundMode) => {
    if (typeof (window as any).setBackgroundMode === 'function') {
      (window as any).setBackgroundMode(mode);
    }
  };

  // Phases de test avec modes de fond correspondants
  const testPhases = [
    { 
      name: '🌌 Nuit profonde', 
      mode: 'night' as BackgroundMode,
      time: createSimulatedTime(2, 0) 
    },
    { 
      name: '🌅 Aube', 
      mode: 'dawn' as BackgroundMode,
      time: sunTimes ? sunTimes.dawn : createSimulatedTime(6, 0) 
    },
    { 
      name: '🌄 Lever du soleil', 
      mode: 'sunrise' as BackgroundMode,
      time: sunTimes ? sunTimes.sunrise : createSimulatedTime(7, 0) 
    },
    { 
      name: '🌞 Matin', 
      mode: 'morning' as BackgroundMode,
      time: createSimulatedTime(9, 0) 
    },
    { 
      name: '☀️ Midi (zénith)', 
      mode: 'midday' as BackgroundMode,
      time: createSimulatedTime(12, 0) 
    },
    { 
      name: '🌇 Après-midi', 
      mode: 'afternoon' as BackgroundMode,
      time: createSimulatedTime(15, 0) 
    },
    { 
      name: '🌆 Coucher du soleil', 
      mode: 'sunset' as BackgroundMode,
      time: sunTimes ? sunTimes.sunset : createSimulatedTime(18, 0) 
    },
    { 
      name: '🌃 Crépuscule', 
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
    const currentRealTime = new Date();
    onTimeChange(currentRealTime);

    // 🔧 CISCO: Utiliser les données solaires réelles selon la position géographique
    if (locationReady && sunTimes && typeof (window as any).setBackgroundMode === 'function') {
      const now = currentRealTime.getTime();
      let targetMode: BackgroundMode;

      // Calculer le mode basé sur les heures solaires réelles de la position de l'utilisateur
      if (now < sunTimes.dawn.getTime()) {
        targetMode = 'night';
      } else if (now < sunTimes.sunrise.getTime()) {
        targetMode = 'dawn';
      } else if (now < sunTimes.sunrise.getTime() + (2 * 60 * 60 * 1000)) { // 2h après lever
        targetMode = 'sunrise';
      } else if (now < sunTimes.solarNoon.getTime() - (1 * 60 * 60 * 1000)) { // 1h avant midi solaire
        targetMode = 'morning';
      } else if (now < sunTimes.solarNoon.getTime() + (3 * 60 * 60 * 1000)) { // 3h après midi solaire
        targetMode = 'midday';
      } else if (now < sunTimes.sunset.getTime() - (1 * 60 * 60 * 1000)) { // 1h avant coucher
        targetMode = 'afternoon';
      } else if (now < sunTimes.sunset.getTime()) {
        targetMode = 'sunset';
      } else if (now < sunTimes.dusk.getTime()) {
        targetMode = 'dusk';
      } else {
        targetMode = 'night';
      }

      console.log(`🌍 Mode calculé selon position géographique (${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)}): ${targetMode}`);
      (window as any).setBackgroundMode(targetMode);
    } else {
      // Fallback: utiliser l'heure locale simple si pas de géolocalisation
      console.log('⚠️ Fallback: utilisation de l\'heure locale simple (pas de géolocalisation)');
      const hour = currentRealTime.getHours();
      let targetMode: BackgroundMode;

      if (hour >= 5 && hour < 6) {
        targetMode = 'dawn';
      } else if (hour >= 6 && hour < 8) {
        targetMode = 'sunrise';
      } else if (hour >= 8 && hour < 11) {
        targetMode = 'morning';
      } else if (hour >= 11 && hour < 15) {
        targetMode = 'midday';
      } else if (hour >= 15 && hour < 18) {
        targetMode = 'afternoon';
      } else if (hour >= 18 && hour < 20) {
        targetMode = 'sunset';
      } else if (hour >= 20 && hour < 22) {
        targetMode = 'dusk';
      } else {
        targetMode = 'night';
      }

      if (typeof (window as any).setBackgroundMode === 'function') {
        (window as any).setBackgroundMode(targetMode);
      }
    }

    console.log(`✅ Temps réel actualisé: ${currentRealTime.toLocaleTimeString('fr-FR')}`);
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
          title="Panneau de Contrôle Arrière-plan"
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
              <div className="font-semibold text-[#A550F5]">🎨 Contrôles d'Ambiance</div>
              <div className="text-gray-300">Changez l'heure et l'atmosphère</div>
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
        <h3 className="text-lg font-bold text-[#A550F5]">🎨 Contrôle Arrière-plan</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>

      {/* Affichage du temps actuel */}
      <div className="mb-3 p-2 bg-gray-800 rounded">
        <div className="text-xs text-gray-400">Temps simulé:</div>
        <div className="text-lg font-mono text-[#A550F5]">{formatTime(currentSimulatedTime)}</div>
      </div>

      {/* Boutons de contrôle des modes */}
      <div className="mb-3">
        <div className="mb-2 text-xs font-semibold text-[#A550F5]">🌅 Modes Arrière-plan:</div>
        <div className="grid grid-cols-2 gap-2">
          {testPhases.map((phase, index) => (
            <button
              key={index}
              onClick={() => {
                setBackgroundMode(phase.mode);
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
        {isExpanded ? '🔼 Masquer contrôles' : '🔽 Contrôles avancés'}
      </button>

      {/* Contrôles avancés */}
      {isExpanded && (
        <div className="border-t border-gray-600 pt-3">
          <div className="mb-3">
            <label className="block text-xs text-gray-400 mb-1">Heure manuelle:</label>
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
                title="Actualiser - Retour au temps réel et synchronisation de l'arrière-plan"
              >
                🔄 Actualiser
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
