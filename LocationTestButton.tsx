import React, { useState } from 'react';
import { useLocation } from './LocationContext';

// Positions de test pour différentes villes du monde (sélection réduite)
const TEST_LOCATIONS = [
  { name: 'Paris, France', lat: 48.8566, lon: 2.3522, timezone: 'Europe/Paris' },
  { name: 'Bucarest, Roumanie', lat: 44.4268, lon: 26.1025, timezone: 'Europe/Bucharest' },
  { name: 'Londres, Royaume-Uni', lat: 51.5074, lon: -0.1278, timezone: 'Europe/London' },
  { name: 'Berlin, Allemagne', lat: 52.5200, lon: 13.4050, timezone: 'Europe/Berlin' },
  { name: 'Tokyo, Japon', lat: 35.6762, lon: 139.6503, timezone: 'Asia/Tokyo' },
  { name: 'New York, USA', lat: 40.7128, lon: -74.0060, timezone: 'America/New_York' },
  { name: 'Sydney, Australie', lat: -33.8688, lon: 151.2093, timezone: 'Australia/Sydney' },
  { name: 'Reykjavik, Islande', lat: 64.1466, lon: -21.9426, timezone: 'Atlantic/Reykjavik' }
];

const LocationTestButton: React.FC = () => {
  const { userLocation, locationReady, locationSource, requestLocation, setManualLocation, locationName } = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  // Ne s'afficher qu'en mode développement
  const isDevelopment = import.meta.env.DEV || window.location.hostname === 'localhost';
  
  if (!isDevelopment) {
    return null; // Masquer complètement en production
  }

  // Fonction pour obtenir l'heure locale d'une ville
  const getLocalTime = (timezone: string): string => {
    try {
      return new Date().toLocaleTimeString('fr-FR', {
        timeZone: timezone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-20 bg-blue-600/80 hover:bg-blue-700/80 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 z-40 shadow-lg"
        title="Panel de test de géolocalisation (DEV uniquement)"
      >
        🧪
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-20 bg-black/90 text-white p-4 rounded-lg backdrop-blur-sm z-40 max-w-sm shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-lg font-bold text-blue-400">🧪 Test Géolocalisation</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white text-xl leading-none"
        >
          ×
        </button>
      </div>
      
      {/* Informations de localisation actuelle */}
      <div className="mb-3 text-sm">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">📍</span>
          <span className="font-semibold">Position actuelle</span>
        </div>
        
        <div className="text-xs space-y-1 ml-6">
          <div><strong>Lieu:</strong> {locationName}</div>
          <div><strong>Coordonnées:</strong> {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}</div>
          <div><strong>Source:</strong> 
            <span className={`ml-1 px-2 py-0.5 rounded text-xs ${
              locationSource === 'gps' ? 'bg-green-600' : 
              locationSource === 'manual' ? 'bg-blue-600' : 'bg-gray-600'
            }`}>
              {locationSource === 'gps' ? 'GPS' : locationSource === 'manual' ? 'Manuel' : 'Défaut'}
            </span>
          </div>
          <div><strong>État:</strong> 
            <span className={`ml-1 ${locationReady ? 'text-green-400' : 'text-red-400'}`}>
              {locationReady ? 'Prêt' : 'En attente...'}
            </span>
          </div>
        </div>
      </div>

      {/* Bouton GPS */}
      <div className="mb-3">
        <button
          onClick={requestLocation}
          className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs transition-colors w-full"
          title="Demander la géolocalisation GPS"
        >
          🌍 Demander GPS
        </button>
      </div>

      {/* Positions de test */}
      <div className="border-t border-gray-600 pt-3">
        <div className="mb-2 text-xs font-semibold">🧪 Positions de test:</div>
        
        <div className="space-y-1">
          {TEST_LOCATIONS.map((location, index) => {
            const localTime = getLocalTime(location.timezone);
            const isCurrentLocation = 
              Math.abs(userLocation.lat - location.lat) < 0.01 && 
              Math.abs(userLocation.lon - location.lon) < 0.01;

            return (
              <button
                key={index}
                onClick={() => setManualLocation(location.lat, location.lon, location.name)}
                className={`w-full text-left p-2 rounded text-xs transition-colors ${
                  isCurrentLocation 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="font-medium">{location.name}</div>
                <div className="text-gray-300">
                  {location.lat.toFixed(2)}, {location.lon.toFixed(2)}
                </div>
                <div className="text-gray-400">
                  🕐 {localTime}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-600 text-xs text-gray-400">
          💡 Cliquez sur une ville pour tester les dégradés selon sa position solaire
        </div>
      </div>
    </div>
  );
};

export default LocationTestButton;
