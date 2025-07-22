import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface LocationContextType {
  userLocation: { lat: number; lon: number };
  locationReady: boolean;
  locationSource: 'gps' | 'default' | 'manual';
  requestLocation: () => void;
  setManualLocation: (lat: number, lon: number, locationName?: string) => void;
  locationName: string;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number }>({
    lat: 48.8566, // Paris par défaut
    lon: 2.3522
  });
  const [locationReady, setLocationReady] = useState(true); // 🔧 CORRECTION: Démarrer en mode prêt avec Paris par défaut
  const [locationSource, setLocationSource] = useState<'gps' | 'default' | 'manual'>('default');
  const [locationName, setLocationName] = useState('Paris (par défaut)');

  // Fonction pour obtenir la géolocalisation GPS
  const requestLocation = () => {
    if (navigator.geolocation) {
      console.log('📍 Demande de géolocalisation GPS...');

      // Timeout de sécurité pour éviter l'attente infinie
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Timeout géolocalisation - Utilisation de Paris par défaut');
        setLocationSource('default');
        // locationReady reste true
      }, 5000); // 5 secondes au lieu de 15

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId); // Annuler le timeout
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          setLocationSource('gps');
          // locationReady reste true

          // Essayer de déterminer le nom de la ville (approximatif)
          const cityName = getCityNameFromCoords(latitude, longitude);
          setLocationName(cityName);

          console.log(`📍 Position GPS obtenue: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (${cityName})`);
        },
        (error) => {
          clearTimeout(timeoutId); // Annuler le timeout
          console.warn('❌ Géolocalisation GPS refusée:', error.message);
          setLocationSource('default');
          // locationReady reste true
          console.log('📍 Utilisation de Paris par défaut');
        },
        {
          timeout: 4000, // 4 secondes au lieu de 15
          enableHighAccuracy: false, // Moins précis mais plus rapide
          maximumAge: 300000 // Cache pendant 5 minutes
        }
      );
    } else {
      console.warn('❌ Géolocalisation non supportée par ce navigateur');
      setLocationSource('default');
      // locationReady reste true
    }
  };

  // Fonction pour définir manuellement une position (pour les tests)
  const setManualLocation = (lat: number, lon: number, locationName?: string) => {
    setUserLocation({ lat, lon });
    setLocationSource('manual');
    setLocationReady(true);
    
    const cityName = locationName || getCityNameFromCoords(lat, lon);
    setLocationName(cityName);
    
    console.log(`📍 Position manuelle définie: ${lat.toFixed(4)}, ${lon.toFixed(4)} (${cityName})`);
  };

  // Fonction pour obtenir un nom de ville approximatif basé sur les coordonnées
  const getCityNameFromCoords = (lat: number, lon: number): string => {
    // Quelques villes de référence pour les tests
    const cities = [
      { name: 'Paris, France', lat: 48.8566, lon: 2.3522 },
      { name: 'Bucarest, Roumanie', lat: 44.4268, lon: 26.1025 },
      { name: 'Londres, Royaume-Uni', lat: 51.5074, lon: -0.1278 },
      { name: 'Berlin, Allemagne', lat: 52.5200, lon: 13.4050 },
      { name: 'Madrid, Espagne', lat: 40.4168, lon: -3.7038 },
      { name: 'Rome, Italie', lat: 41.9028, lon: 12.4964 },
      { name: 'Stockholm, Suède', lat: 59.3293, lon: 18.0686 },
      { name: 'Helsinki, Finlande', lat: 60.1699, lon: 24.9384 },
      { name: 'Athènes, Grèce', lat: 37.9838, lon: 23.7275 },
      { name: 'Lisbonne, Portugal', lat: 38.7223, lon: -9.1393 }
    ];

    // Trouver la ville la plus proche
    let closestCity = cities[0];
    let minDistance = getDistance(lat, lon, closestCity.lat, closestCity.lon);

    for (const city of cities) {
      const distance = getDistance(lat, lon, city.lat, city.lon);
      if (distance < minDistance) {
        minDistance = distance;
        closestCity = city;
      }
    }

    // Si la distance est très petite, c'est probablement la bonne ville
    if (minDistance < 50) { // 50 km
      return closestCity.name;
    }

    // Sinon, retourner les coordonnées
    return `${lat.toFixed(2)}°N, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`;
  };

  // Fonction pour calculer la distance entre deux points (formule de Haversine simplifiée)
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Demander automatiquement la géolocalisation au démarrage
  useEffect(() => {
    console.log('🏁 LocationProvider initialisé - Demande de géolocalisation GPS...');
    requestLocation(); // Demander automatiquement la position GPS
  }, []);

  return (
    <LocationContext.Provider value={{
      userLocation,
      locationReady,
      locationSource,
      requestLocation,
      setManualLocation,
      locationName
    }}>
      {children}
    </LocationContext.Provider>
  );
};
