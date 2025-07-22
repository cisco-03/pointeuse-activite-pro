import React, { useEffect, useRef, useState } from 'react';

// Types pour les différents types d'ambiances sonores - Basés sur les fichiers réels
type AmbientSoundType = 
  // Nuit profonde
  | 'hibou-molkom' | 'night-atmosphere-with-crickets-374652'
  // Aube  
  | 'village_morning_birds_roosters'
  // Lever de soleil
  | 'blackbird'
  // Matin
  | 'insect_bee_fly' | 'morning-birdsong'
  // Midi
  | 'forest_cicada'
  // Après-midi
  | 'birds-singing' | 'summer-insects-243572'
  // Coucher de soleil
  | 'bird-chirp' | 'grillon-drome'
  // Crépuscule
  | 'cricket-single' | 'merle-blackbird'
  // Anciens types (pour compatibilité)
  | 'birds' | 'wind' | 'rain' | 'waves' | 'forest' | 'night'
  | 'none';         // Silence

interface AmbientSoundManagerProps {
  skyMode: string;
  enabled?: boolean;
  volume?: number; // 0 à 1
}

// 🔧 CISCO: Configuration avancée avec support du mixage audio simultané
const SOUND_CONFIG: Record<string, {
  sound: AmbientSoundType;
  volume: number;
  folder: string;
  isShort?: boolean; // Pour les fichiers courts qui doivent être en boucle
  fadeInDuration?: number; // Durée du fondu d'entrée en ms
  fadeOutDuration?: number; // Durée du fondu de sortie en ms
  alternatives?: AmbientSoundType[]; // Fichiers alternatifs pour variété
  rotationInterval?: number; // Intervalle de rotation des alternatives en ms
  // 🔧 NOUVEAU: Support du mixage simultané
  simultaneousSounds?: AmbientSoundType[]; // Sons à jouer en même temps
  mixingMode?: 'rotation' | 'simultaneous'; // Mode de lecture
}> = {
  night: {
    sound: 'night-atmosphere-with-crickets-374652',
    volume: 0.6,
    folder: 'nuit-profonde',
    fadeInDuration: 800,
    fadeOutDuration: 1000,
    // 🔧 CISCO: Mixage simultané pour la nuit (criquets + hibou)
    simultaneousSounds: ['hibou-molkom'],
    mixingMode: 'simultaneous', // Jouer les deux en même temps
    rotationInterval: 60000 // Rotation du hibou toutes les 60 secondes
  },
  dusk: {
    sound: 'merle-blackbird',
    volume: 0.4,
    folder: 'crepuscule',
    isShort: true,
    fadeInDuration: 600,
    fadeOutDuration: 800,
    // 🔧 CISCO: Mixage simultané pour le crépuscule (merle + grillon unique)
    simultaneousSounds: ['cricket-single'],
    mixingMode: 'simultaneous',
    rotationInterval: 70000 // Variation toutes les 70 secondes
  },
  dawn: { 
    sound: 'village_morning_birds_roosters', 
    volume: 0.5, 
    folder: 'aube',
    fadeInDuration: 600,
    fadeOutDuration: 800
  },
  sunrise: { 
    sound: 'blackbird', 
    volume: 0.6, 
    folder: 'lever-soleil',
    isShort: true,
    fadeInDuration: 500,
    fadeOutDuration: 700
  },
  morning: {
    sound: 'morning-birdsong',
    volume: 0.7,
    folder: 'matin',
    fadeInDuration: 500,
    fadeOutDuration: 700,
    // 🔧 CISCO: Mixage simultané pour le matin (chants d'oiseaux + bourdonnement d'insectes)
    simultaneousSounds: ['insect_bee_fly'],
    mixingMode: 'simultaneous',
    rotationInterval: 90000 // Variation toutes les 90 secondes
  },
  midday: {
    sound: 'forest_cicada',
    volume: 0.3,
    folder: 'midi',
    isShort: true,
    fadeInDuration: 600,
    fadeOutDuration: 800
    // Pas de mixage (1 seul fichier)
  },
  afternoon: {
    sound: 'summer-insects-243572',
    volume: 0.4,
    folder: 'apres-midi',
    fadeInDuration: 600,
    fadeOutDuration: 800,
    // 🔧 CISCO: Mixage simultané pour l'après-midi (insectes d'été + chants d'oiseaux)
    simultaneousSounds: ['birds-singing'],
    mixingMode: 'simultaneous',
    rotationInterval: 75000 // Variation toutes les 75 secondes
  },
  sunset: {
    sound: 'grillon-drome',
    volume: 0.4,
    folder: 'coucher-soleil',
    isShort: true,
    fadeInDuration: 700,
    fadeOutDuration: 900,
    // 🔧 CISCO: Mixage simultané pour le coucher (grillons + pépiements d'oiseaux)
    simultaneousSounds: ['bird-chirp'],
    mixingMode: 'simultaneous',
    rotationInterval: 80000 // Variation toutes les 80 secondes
  }
};

// 🔧 CISCO: Système de normalisation audio pour équilibrer les volumes
const AUDIO_NORMALIZATION: Record<AmbientSoundType, number> = {
  // Nuit profonde
  'night-atmosphere-with-crickets-374652': 1.0,  // Volume de référence
  'hibou-molkom': 0.8,                            // Hibou plus doux

  // Aube
  'village_morning_birds_roosters': 0.9,          // Coqs un peu plus doux

  // Lever de soleil
  'blackbird': 1.1,                               // Merle un peu plus fort

  // Matin
  'morning-birdsong': 1.0,                        // Chants d'oiseaux référence
  'insect_bee_fly': 0.7,                          // Bourdonnement plus doux

  // Midi
  'forest_cicada': 1.2,                           // Cigales plus fortes (naturel)

  // Après-midi
  'summer-insects-243572': 0.9,                   // Insectes d'été modérés
  'birds-singing': 1.0,                           // Chants d'oiseaux référence

  // Coucher de soleil
  'grillon-drome': 0.8,                           // Grillons doux
  'bird-chirp': 1.1,                              // Pépiements plus audibles

  // Crépuscule
  'merle-blackbird': 1.0,                         // Merle référence
  'cricket-single': 0.6,                          // Grillon unique très doux

  // Anciens types (compatibilité)
  'birds': 1.0, 'wind': 1.0, 'rain': 1.0, 'waves': 1.0, 'forest': 1.0, 'night': 1.0, 'none': 0.0
};

// Fonction pour obtenir le volume normalisé d'un son
const getNormalizedVolume = (soundType: AmbientSoundType, baseVolume: number): number => {
  const normalizationFactor = AUDIO_NORMALIZATION[soundType] || 1.0;
  return baseVolume * normalizationFactor;
};

// Fonction pour générer les URLs selon la structure des fichiers réels
const getSoundUrl = (soundType: AmbientSoundType, folder?: string): string => {
  if (soundType === 'none') return '';

  // Pour les anciens types (compatibilité), utiliser l'ancien système
  if (['birds', 'wind', 'rain', 'waves', 'forest', 'night'].includes(soundType)) {
    return `/sounds/${soundType}.mp3`;
  }

  // Pour les nouveaux types (noms de fichiers réels), utiliser la structure organisée
  if (folder) {
    return `/sounds/${folder}/${soundType}.mp3`;
  }

  // Fallback vers le dossier racine
  return `/sounds/${soundType}.mp3`;
};

const AmbientSoundManager: React.FC<AmbientSoundManagerProps> = ({
  skyMode,
  enabled = false, // 🔧 CISCO: Audio désactivé par défaut - activation manuelle
  volume = 0.5
}) => {
  // 🔧 CISCO: Support du mixage audio simultané
  const audioRef = useRef<HTMLAudioElement | null>(null); // Son principal
  const simultaneousAudioRefs = useRef<HTMLAudioElement[]>([]); // Sons simultanés
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [currentSimultaneousSounds, setCurrentSimultaneousSounds] = useState<AmbientSoundType[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const rotationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSoundIndex, setCurrentSoundIndex] = useState(0); // Pour la rotation des alternatives

  // 🔧 Fonction pour sélectionner un son en rotation séquentielle pour plus de variété
  const selectRandomSound = (config: typeof SOUND_CONFIG[string]): AmbientSoundType => {
    const allSounds = [config.sound, ...(config.alternatives || [])];
    
    // Rotation séquentielle pour assurer que tous les sons sont entendus
    const selectedSound = allSounds[currentSoundIndex % allSounds.length];
    setCurrentSoundIndex(prev => (prev + 1) % allSounds.length);
    
    return selectedSound;
  };

  // 🔧 Fonction pour programmer la rotation automatique des sons
  const scheduleRotation = (config: typeof SOUND_CONFIG[string]) => {
    // Nettoyer l'ancien timer
    if (rotationTimeoutRef.current) {
      clearTimeout(rotationTimeoutRef.current);
    }

    // Programmer la prochaine rotation si des alternatives existent
    if (config.alternatives && config.alternatives.length > 0 && config.rotationInterval) {
      rotationTimeoutRef.current = setTimeout(() => {
        if (enabled && isPlaying) {
          changeSoundTo(config); // Changera automatiquement au son suivant
        }
      }, config.rotationInterval);
    }
  };

  // 🔧 CISCO: Nouvelle fonction pour gérer le mixage simultané
  const startSimultaneousSounds = async (sounds: AmbientSoundType[], folder: string, baseVolume: number) => {
    console.log(`🎼 Démarrage de ${sounds.length} sons simultanés:`, sounds);

    // Nettoyer les anciens sons simultanés
    simultaneousAudioRefs.current.forEach(audio => {
      if (audio) {
        audio.pause();
        audio.volume = 0;
      }
    });
    simultaneousAudioRefs.current = [];

    // Créer et démarrer chaque son simultané
    for (const soundType of sounds) {
      try {
        const soundUrl = getSoundUrl(soundType, folder);
        const audio = new Audio(soundUrl);
        audio.loop = true;
        audio.volume = 0;

        // Attendre que le son soit prêt
        await new Promise<void>((resolve, reject) => {
          audio.addEventListener('canplaythrough', () => resolve(), { once: true });
          audio.addEventListener('error', reject, { once: true });
          audio.load();
        });

        // Démarrer le son et faire un fade-in
        await audio.play();
        simultaneousAudioRefs.current.push(audio);

        // 🔧 CISCO: Fade-in progressif avec normalisation audio
        const normalizedVolume = getNormalizedVolume(soundType, baseVolume * volume * 0.7);
        await performFadeIn(audio, normalizedVolume, 2000);

        console.log(`✅ Son simultané démarré: ${soundType}`);
      } catch (error) {
        console.warn(`⚠️ Erreur lors du démarrage du son simultané ${soundType}:`, error);
      }
    }

    setCurrentSimultaneousSounds(sounds);
  };

  // 🔧 Fonction améliorée pour changer le son avec support du mixage simultané
  const changeSoundTo = async (soundConfig: typeof SOUND_CONFIG[string]) => {
    if (!enabled) {
      await fadeOutAndStop();
      return;
    }

    // 🔧 CISCO: Vérifier si on doit utiliser le mixage simultané
    if (soundConfig.mixingMode === 'simultaneous' && soundConfig.simultaneousSounds) {
      console.log(`🎼 Mode mixage simultané activé pour ${soundConfig.sound}`);

      // Démarrer le son principal
      const selectedSound = selectRandomSound(soundConfig);
      const targetVolume = soundConfig.volume;

      // 🔧 CISCO: Cross-fade vers le son principal avec normalisation
      const normalizedMainVolume = getNormalizedVolume(selectedSound, targetVolume);
      await crossFadeToNewSound(selectedSound, normalizedMainVolume, soundConfig);

      // Démarrer les sons simultanés
      await startSimultaneousSounds(soundConfig.simultaneousSounds, soundConfig.folder, soundConfig.volume);

      // Programmer la rotation (pour varier les sons simultanés)
      scheduleRotation(soundConfig);
      return;
    }

    // Mode normal (un seul son)
    const selectedSound = selectRandomSound(soundConfig);
    const targetVolume = soundConfig.volume;

    // 🔧 CISCO: Normalisation du volume pour le mode normal
    const normalizedVolume = getNormalizedVolume(selectedSound, targetVolume);

    // Si c'est le même son, ajuster seulement le volume
    if (currentSound === selectedSound && audioRef.current && !isTransitioning) {
      smoothVolumeTransition(normalizedVolume * volume, 1500);
      return;
    }

    // Si on est déjà en transition, attendre qu'elle se termine
    if (isTransitioning) {
      console.log('🎵 Transition déjà en cours, attente...');
      return;
    }

    // Cross-fade vers le nouveau son avec normalisation
    await crossFadeToNewSound(selectedSound, normalizedVolume, soundConfig);

    // Programmer la prochaine rotation
    scheduleRotation(soundConfig);
  };

  // 🔧 NOUVELLE FONCTION: Cross-fade fluide entre deux sons avec durées configurables
  const crossFadeToNewSound = async (newSoundType: AmbientSoundType, targetVolume: number, config: typeof SOUND_CONFIG[string]) => {
    setIsTransitioning(true);

    try {
      // Obtenir l'URL avec le bon dossier et la configuration
      const soundUrl = getSoundUrl(newSoundType, config.folder);
      
      // Étape 1: Charger le nouveau son en silence
      const newAudio = new Audio(soundUrl);
      newAudio.loop = true; // Tous les sons sont en boucle
      newAudio.volume = 0;

      // Attendre que le nouveau son soit prêt
      await new Promise<void>((resolve, reject) => {
        newAudio.addEventListener('canplaythrough', () => resolve(), { once: true });
        newAudio.addEventListener('error', reject, { once: true });
        newAudio.load();
      });

      // Étape 2: Démarrer le nouveau son en silence
      await newAudio.play();

      // Étape 3: Cross-fade (fondu croisé) avec durées configurables
      if (audioRef.current && isPlaying) {
        // Fade out l'ancien et fade in le nouveau simultanément
        await performCrossFade(audioRef.current, newAudio, targetVolume * volume, config.fadeInDuration || 3000);
      } else {
        // Pas d'ancien son, juste fade in le nouveau
        await performFadeIn(newAudio, targetVolume * volume, config.fadeInDuration || 2000);
      }

      // Étape 4: Remplacer l'ancienne référence
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = newAudio;
      setCurrentSound(newSoundType);
      setIsPlaying(true);

      console.log(`🎵 Cross-fade vers ${newSoundType} terminé`);

    } catch (error) {
      console.warn(`⚠️ Erreur lors du cross-fade vers ${newSoundType}:`, error);
      setCurrentSound('none');
      setIsPlaying(false);
    } finally {
      setIsTransitioning(false);
    }
  };

  // 🔧 NOUVELLE FONCTION: Transition de volume ultra fluide
  const smoothVolumeTransition = (targetVolume: number, duration: number = 2000) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const volumeDifference = targetVolume - startVolume;
    const startTime = Date.now();

    const updateVolume = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function pour une transition plus naturelle
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      
      audio.volume = startVolume + (volumeDifference * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(updateVolume);
      }
    };

    requestAnimationFrame(updateVolume);
  };

  // 🔧 NOUVELLE FONCTION: Cross-fade entre deux sons avec durée personnalisée
  const performCrossFade = (oldAudio: HTMLAudioElement, newAudio: HTMLAudioElement, targetVolume: number, duration: number = 3000): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const initialOldVolume = oldAudio.volume;

      const crossFadeStep = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing pour plus de naturel
        const easedProgress = 1 - Math.pow(1 - progress, 2); // ease-out quadratic

        // Fade out l'ancien son
        oldAudio.volume = initialOldVolume * (1 - easedProgress);
        
        // Fade in le nouveau son
        newAudio.volume = targetVolume * easedProgress;

        if (progress < 1) {
          requestAnimationFrame(crossFadeStep);
        } else {
          oldAudio.pause();
          resolve();
        }
      };

      requestAnimationFrame(crossFadeStep);
    });
  };

  // 🔧 NOUVELLE FONCTION: Fade in fluide avec durée personnalisée
  const performFadeIn = (audio: HTMLAudioElement, targetVolume: number, duration: number = 2000): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();

      const fadeInStep = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing pour plus de naturel
        const easedProgress = 1 - Math.pow(1 - progress, 2); // ease-out quadratic
        
        audio.volume = targetVolume * easedProgress;

        if (progress < 1) {
          requestAnimationFrame(fadeInStep);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(fadeInStep);
    });
  };

  // 🔧 CISCO: Fade out et arrêt avec support des sons simultanés
  const fadeOutAndStop = async (): Promise<void> => {
    if (!audioRef.current || !isPlaying) return;

    const config = SOUND_CONFIG[skyMode];
    const fadeOutDuration = config?.fadeOutDuration || 2000;

    return new Promise<void>((resolve) => {
      const audio = audioRef.current!;
      const startTime = Date.now();
      const initialVolume = audio.volume;

      // 🔧 CISCO: Fade out simultané de tous les sons
      const simultaneousInitialVolumes = simultaneousAudioRefs.current.map(simAudio => simAudio.volume);

      const fadeOutStep = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / fadeOutDuration, 1);

        // Easing pour un fade-out plus naturel
        const easedProgress = Math.pow(progress, 2); // ease-in quadratic

        // Fade out du son principal
        audio.volume = initialVolume * (1 - easedProgress);

        // 🔧 CISCO: Fade out des sons simultanés
        simultaneousAudioRefs.current.forEach((simAudio, index) => {
          if (simAudio && simultaneousInitialVolumes[index] !== undefined) {
            simAudio.volume = simultaneousInitialVolumes[index] * (1 - easedProgress);
          }
        });

        if (progress < 1) {
          requestAnimationFrame(fadeOutStep);
        } else {
          // Arrêter le son principal
          audio.pause();
          audio.volume = 0;

          // 🔧 CISCO: Arrêter tous les sons simultanés
          simultaneousAudioRefs.current.forEach(simAudio => {
            if (simAudio) {
              simAudio.pause();
              simAudio.volume = 0;
            }
          });
          simultaneousAudioRefs.current = [];

          setIsPlaying(false);
          setCurrentSound('none');
          setCurrentSimultaneousSounds([]);
          resolve();
        }
      };

      requestAnimationFrame(fadeOutStep);
    });
  };

  // Transition de volume douce
  const fadeToVolume = (targetVol: number) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const difference = targetVol - startVolume;
    const steps = 30;
    const stepAmount = difference / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      currentStep++;
      audio.volume = Math.max(0, Math.min(1, startVolume + (stepAmount * currentStep)));
      
      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, 50);
  };

  // Réagir aux changements de mode de ciel
  useEffect(() => {
    console.log(`🎵 AmbientSoundManager: Changement détecté - skyMode: ${skyMode}, enabled: ${enabled}`);
    const config = SOUND_CONFIG[skyMode] || { sound: 'none' as AmbientSoundType, volume: 0, folder: '' };
    console.log(`🎵 Configuration audio pour ${skyMode}:`, config);
    changeSoundTo(config);
  }, [skyMode, enabled]);

  // Réagir aux changements de volume global
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      const config = SOUND_CONFIG[skyMode] || { sound: 'none' as AmbientSoundType, volume: 0, folder: '' };
      fadeToVolume(config.volume * volume);
    }
  }, [volume]);

  // 🔧 CISCO: Nettoyage lors du démontage avec support des sons simultanés
  useEffect(() => {
    return () => {
      // Nettoyer le son principal
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // 🔧 CISCO: Nettoyer tous les sons simultanés
      simultaneousAudioRefs.current.forEach(simAudio => {
        if (simAudio) {
          simAudio.pause();
        }
      });
      simultaneousAudioRefs.current = [];

      // Nettoyer le timer de rotation
      if (rotationTimeoutRef.current) {
        clearTimeout(rotationTimeoutRef.current);
      }
    };
  }, []);

  // Interface pour debug/contrôle - SUPPRIMÉ pour éviter les doublons
  if (!enabled) return null;

  return null; // Plus d'affichage de debug
};

export default AmbientSoundManager;
