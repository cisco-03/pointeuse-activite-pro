import React, { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';

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

// 🔧 CISCO: Configuration audio SYNCHRONISÉE avec transitions visuelles (15-20s)
const SOUND_CONFIG: Record<string, {
  sound: AmbientSoundType;
  volume: number;
  folder: string;
  isShort?: boolean; // Pour les fichiers courts qui doivent être en boucle
  fadeInDuration: number; // Durée du fondu d'entrée en ms - SYNCHRONISÉ avec visuel
  fadeOutDuration: number; // Durée du fondu de sortie en ms - SYNCHRONISÉ avec visuel
  visualTransitionDuration?: number; // Durée de la transition visuelle correspondante
}> = {
  night: {
    sound: 'night-atmosphere-with-crickets-374652',
    volume: 0.6,
    folder: 'nuit-profonde',
    fadeInDuration: 5000, // 🔧 CISCO: 5 secondes pour synchronisation
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 15000 // 15 secondes visuel
  },
  dusk: {
    sound: 'merle-blackbird',
    volume: 0.4,
    folder: 'crepuscule',
    isShort: true,
    fadeInDuration: 5000, // 🔧 CISCO: 5 secondes pour synchronisation
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 15000 // 15 secondes visuel
  },
  dawn: {
    sound: 'village_morning_birds_roosters',
    volume: 0.5,
    folder: 'aube',
    fadeInDuration: 5000, // 🔧 CISCO: 5 secondes pour synchronisation
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 15000 // 15 secondes visuel
  },
  sunrise: {
    sound: 'blackbird',
    volume: 0.6,
    folder: 'lever-soleil',
    isShort: true,
    fadeInDuration: 5000, // 🔧 CISCO: 5 secondes pour synchronisation
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 15000 // 15 secondes visuel
  },
  morning: {
    sound: 'morning-birdsong',
    volume: 0.7,
    folder: 'matin',
    fadeInDuration: 6000, // 🔧 CISCO: 6 secondes pour le matin (transition plus longue)
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 20000 // 20 secondes visuel pour le matin
  },
  midday: {
    sound: 'forest_cicada',
    volume: 0.3,
    folder: 'midi',
    isShort: true,
    fadeInDuration: 5000, // 🔧 CISCO: 5 secondes pour synchronisation
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 15000 // 15 secondes visuel
  },
  afternoon: {
    sound: 'summer-insects-243572',
    volume: 0.4,
    folder: 'apres-midi',
    fadeInDuration: 5000, // 🔧 CISCO: 5 secondes pour synchronisation
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 15000 // 15 secondes visuel
  },
  sunset: {
    sound: 'grillon-drome',
    volume: 0.4,
    folder: 'coucher-soleil',
    isShort: true,
    fadeInDuration: 5000, // 🔧 CISCO: 5 secondes pour synchronisation
    fadeOutDuration: 2000, // 🔧 CISCO: 2 secondes pour arrêt rapide
    visualTransitionDuration: 15000 // 15 secondes visuel
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
  // 🔧 CISCO: SYSTÈME AUDIO EXCLUSIF - UN SEUL MODE ACTIF
  const audioRef = useRef<HTMLAudioElement | null>(null); // Son principal UNIQUE
  const [currentSound, setCurrentSound] = useState<AmbientSoundType>('none');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [activeModeAudio, setActiveModeAudio] = useState<string>('none'); // 🔧 CISCO: Mode audio actuel

  // 🔧 CISCO: NOUVEAU - AbortController pour annuler les opérations async
  const abortControllerRef = useRef<AbortController | null>(null);

  // 🔧 CISCO: NOUVEAU - Mutex pour empêcher les transitions simultanées
  const transitionMutexRef = useRef<boolean>(false);

  // 🔧 CISCO: FONCTION UTILITAIRE - Vérifier si enabled ou annuler
  const checkEnabledOrAbort = (): boolean => {
    if (!enabled) {
      console.log('🔇 CISCO: Audio désactivé - Opération annulée');
      return false;
    }
    if (abortControllerRef.current?.signal.aborted) {
      console.log('🛑 CISCO: Opération annulée par AbortController');
      return false;
    }
    return true;
  };

  // 🔧 CISCO: FONCTION SYNCHRONISATION - Calculer délai pour synchronisation avec visuel
  const calculateSyncDelay = (config: typeof SOUND_CONFIG[string]): number => {
    // Démarrer le fade in audio après 20% de la transition visuelle pour une meilleure synchronisation
    const visualDuration = config.visualTransitionDuration || 15000;
    const syncDelay = Math.floor(visualDuration * 0.2); // 20% de la transition visuelle
    return Math.min(syncDelay, 3000); // Maximum 3 secondes de délai
  };

  // 🔧 CISCO: NETTOYAGE AMÉLIORÉ - Seulement notre instance audio
  useEffect(() => {
    console.log('🧹 CISCO: Initialisation audio manager');

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();

    // Reset complet de l'état
    setCurrentSound('none');
    setIsPlaying(false);
    setIsTransitioning(false);
    setActiveModeAudio('none');
    transitionMutexRef.current = false;

    console.log('🧹 CISCO: Audio manager initialisé');
  }, []); // Une seule fois au montage

  // 🔧 CISCO: État pour tracker le mode actuel et éviter les changements redondants
  const [currentMode, setCurrentMode] = useState<string>(skyMode);

  // 🔧 CISCO: État pour ignorer temporairement les changements automatiques
  const [manualModeActive, setManualModeActive] = useState<boolean>(false);
  const manualModeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔧 CISCO: Fonction simplifiée - Un seul son par mode (pas d'alternatives)
  const selectRandomSound = (config: typeof SOUND_CONFIG[string]): AmbientSoundType => {
    return config.sound; // 🔧 CISCO: Mode exclusif - un seul son par mode
  };

  // 🔧 CISCO: FONCTION SUPPRIMÉE - Plus de mixage simultané (mode exclusif)

  // 🔧 CISCO: ARRÊT SIMPLE ET EFFICACE
  const stopCurrentSound = useCallback(() => {
    console.log('🛑 CISCO: Arrêt immédiat du son actuel');

    // Arrêter TOUS les éléments audio de la page pour être sûr
    const allAudioElements = document.querySelectorAll('audio');
    allAudioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;
    });

    // Nettoyer notre référence
    if (audioRef.current) {
      audioRef.current = null;
    }

    // Reset de tous les états
    setIsPlaying(false);
    setCurrentSound('none');
    setActiveModeAudio('none');
    setIsTransitioning(false);

    console.log('🛑 CISCO: Arrêt immédiat terminé');
  }, []);

  // 🔧 CISCO: EFFET ACTIVATION/DÉSACTIVATION SIMPLE
  useEffect(() => {
    console.log(`🎵 CISCO: Audio ${enabled ? 'ACTIVÉ' : 'DÉSACTIVÉ'}`);

    if (!enabled) {
      // Si désactivé, arrêter immédiatement tous les sons
      stopCurrentSound();
    }
  }, [enabled]); // 🔧 CISCO: Seulement enabled pour éviter les erreurs

  // 🔧 CISCO: Fonction de changement immédiat de mode audio avec priorité absolue
  const handleImmediateModeChange = async (newMode: string) => {
    console.log(`🎵 AmbientSoundManager: Changement FORCÉ vers ${newMode} depuis ${currentMode}`);

    // 🔧 CISCO: Activer le mode manuel (ignore les changements automatiques)
    setManualModeActive(true);

    // Nettoyer l'ancien timeout
    if (manualModeTimeoutRef.current) {
      clearTimeout(manualModeTimeoutRef.current);
    }

    // Désactiver le mode manuel après 3 secondes
    manualModeTimeoutRef.current = setTimeout(() => {
      console.log('🔄 Mode manuel désactivé, retour à l\'auto-détection');
      setManualModeActive(false);
    }, 3000);

    // Éviter les changements redondants
    if (newMode === currentMode && !manualModeActive) {
      console.log('🔄 Mode identique, pas de changement audio');
      return;
    }

    setCurrentMode(newMode);

    if (!enabled) {
      console.log('🔇 Audio désactivé, pas de changement de son');
      return;
    }

    const config = SOUND_CONFIG[newMode] || { sound: 'none' as AmbientSoundType, volume: 0, folder: '' };
    console.log(`🎵 Configuration audio FORCÉE pour ${newMode}:`, config);

    // Changement immédiat sans attendre les useEffect
    await changeSoundTo(config);
  };

  // 🔧 CISCO: FONCTION SIMPLE - Arrêt immédiat puis démarrage
  const changeSoundTo = async (soundConfig: typeof SOUND_CONFIG[string]) => {
    // Si audio désactivé, arrêter tout
    if (!enabled) {
      stopCurrentSound();
      return;
    }

    console.log(`🎵 CISCO: Changement SIMPLE vers ${soundConfig.sound}`);

    const selectedSound = selectRandomSound(soundConfig);
    const targetVolume = soundConfig.volume;
    const normalizedVolume = getNormalizedVolume(selectedSound, targetVolume);

    // ÉTAPE 1: ARRÊT IMMÉDIAT de tout son existant
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0;
      audioRef.current = null;
    }

    // ÉTAPE 2: Attente courte pour garantir l'arrêt
    await new Promise(resolve => setTimeout(resolve, 100));

    // ÉTAPE 3: Démarrage du nouveau son (seulement si toujours enabled)
    if (!enabled) return;

    try {
      const soundUrl = getSoundUrl(selectedSound, soundConfig.folder);
      const newAudio = new Audio(soundUrl);
      newAudio.loop = true;
      newAudio.volume = 0;

      await newAudio.play();
      audioRef.current = newAudio;

      // Fade in simple avec setTimeout
      const targetVol = normalizedVolume * volume;
      const steps = 20;
      const stepDuration = 100; // 2 secondes total
      const volumeStep = targetVol / steps;

      for (let i = 0; i <= steps; i++) {
        setTimeout(() => {
          if (audioRef.current === newAudio) {
            newAudio.volume = volumeStep * i;
          }
        }, i * stepDuration);
      }

      setCurrentSound(selectedSound);
      setIsPlaying(true);
      setActiveModeAudio(soundConfig.folder || 'unknown');

      console.log(`✅ CISCO: Son ${selectedSound} démarré`);
    } catch (error) {
      console.error('❌ CISCO: Erreur audio:', error);
      setIsPlaying(false);
      setCurrentSound('none');
    }
  };

  // 🔧 CISCO: FONCTION SUPPRIMÉE - Remplacée par système simple

  // 🔧 CISCO: Transition de volume avec vérifications enabled
  const smoothVolumeTransition = (targetVolume: number, duration: number = 2000) => {
    if (!audioRef.current || !checkEnabledOrAbort()) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const volumeDifference = targetVolume - startVolume;
    const startTime = Date.now();

    const updateVolume = () => {
      // Vérifier si toujours enabled et audio valide
      if (!checkEnabledOrAbort() || !audioRef.current || audioRef.current !== audio) {
        return; // Arrêter la transition si disabled ou audio changé
      }

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

  // 🔧 CISCO: FADE OUT avec vérifications enabled et AbortController
  const performFadeOut = (audio: HTMLAudioElement, duration: number = 1000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const initialVolume = audio.volume;
      const signal = abortControllerRef.current?.signal;

      const fadeOutStep = () => {
        // Vérifier si l'opération a été annulée
        if (signal?.aborted || !checkEnabledOrAbort()) {
          audio.volume = 0;
          reject(new Error('Fade out annulé'));
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing doux pour fade out naturel
        const easedProgress = Math.pow(progress, 1.5); // ease-in plus doux

        audio.volume = initialVolume * (1 - easedProgress);

        if (progress >= 1) {
          audio.volume = 0;
          resolve();
        } else {
          requestAnimationFrame(fadeOutStep);
        }
      };

      requestAnimationFrame(fadeOutStep);
    });
  };

  // 🔧 CISCO: FADE IN avec vérifications enabled et AbortController
  const performFadeIn = (audio: HTMLAudioElement, targetVolume: number, duration: number = 2000): Promise<void> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const signal = abortControllerRef.current?.signal;

      const fadeInStep = () => {
        // Vérifier si l'opération a été annulée
        if (signal?.aborted || !checkEnabledOrAbort()) {
          audio.volume = 0;
          audio.pause();
          reject(new Error('Fade in annulé'));
          return;
        }

        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing doux pour fade in naturel
        const easedProgress = Math.pow(progress, 0.7); // ease-out plus doux

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

  // 🔧 CISCO: Fade out et arrêt avec vérifications enabled
  const fadeOutAndStop = async (): Promise<void> => {
    if (!audioRef.current || !isPlaying) return;

    try {
      await performFadeOut(audioRef.current, 1000); // 1 seconde pour l'arrêt

      // Arrêter complètement
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0;
        audioRef.current = null;
      }

      setIsPlaying(false);
      setCurrentSound('none');
      setActiveModeAudio('none');
    } catch (error) {
      // En cas d'erreur (ex: annulation), forcer l'arrêt
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.volume = 0;
        audioRef.current = null;
      }
      setIsPlaying(false);
      setCurrentSound('none');
      setActiveModeAudio('none');
    }
  };

  // 🔧 CISCO: Transition de volume avec vérifications enabled
  const fadeToVolume = (targetVol: number) => {
    if (!audioRef.current || !checkEnabledOrAbort()) return;

    const audio = audioRef.current;
    const startVolume = audio.volume;
    const difference = targetVol - startVolume;
    const steps = 30;
    const stepAmount = difference / steps;

    let currentStep = 0;
    const fadeInterval = setInterval(() => {
      // Vérifier si toujours enabled et audio valide
      if (!checkEnabledOrAbort() || !audioRef.current || audioRef.current !== audio) {
        clearInterval(fadeInterval);
        return;
      }

      currentStep++;
      audio.volume = Math.max(0, Math.min(1, startVolume + (stepAmount * currentStep)));

      if (currentStep >= steps) {
        clearInterval(fadeInterval);
      }
    }, 50);
  };

  // 🔧 CISCO: Réagir aux changements de mode de ciel avec vérifications enabled
  useEffect(() => {
    // Ne rien faire si audio désactivé
    if (!enabled) {
      console.log(`🔇 Audio désactivé - Ignoré changement vers ${skyMode}`);
      return;
    }

    // 🔧 CISCO: Ignorer les changements automatiques si mode manuel actif
    if (manualModeActive) {
      console.log(`🚫 Mode manuel actif - Ignoré changement automatique vers ${skyMode}`);
      return;
    }

    // Mettre à jour le mode local si différent
    if (skyMode !== currentMode) {
      console.log(`🎵 AmbientSoundManager: Synchronisation mode - skyMode: ${skyMode} vs currentMode: ${currentMode}`);
      setCurrentMode(skyMode);
    }

    console.log(`🎵 AmbientSoundManager: Changement automatique détecté - skyMode: ${skyMode}, enabled: ${enabled}`);
    const config = SOUND_CONFIG[skyMode] || { sound: 'none' as AmbientSoundType, volume: 0, folder: '' };
    console.log(`🎵 Configuration audio automatique pour ${skyMode}:`, config);
    changeSoundTo(config);
  }, [skyMode, enabled, currentMode, manualModeActive]);

  // 🔧 CISCO: Réagir aux changements de volume global avec vérifications
  useEffect(() => {
    if (audioRef.current && isPlaying && enabled) {
      const config = SOUND_CONFIG[skyMode] || { sound: 'none' as AmbientSoundType, volume: 0, folder: '' };
      fadeToVolume(config.volume * volume);
    }
  }, [volume, enabled, skyMode, isPlaying]); // 🔧 CISCO: Dépendances complètes et stables

  // 🔧 CISCO: Écouteur d'événement global pour changement immédiat
  useEffect(() => {
    // Exposer la fonction de changement immédiat globalement
    (window as any).triggerAudioModeChange = handleImmediateModeChange;

    console.log('🎵 AmbientSoundManager: Fonction de changement immédiat exposée globalement');

    return () => {
      // Nettoyer la fonction globale
      delete (window as any).triggerAudioModeChange;
    };
  }, []); // 🔧 CISCO: Pas de dépendances pour éviter les re-créations

  // 🔧 CISCO: Nettoyage lors du démontage avec AbortController
  useEffect(() => {
    return () => {
      // Annuler toutes les opérations async en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Libérer le mutex
      transitionMutexRef.current = false;

      // Nettoyer le son principal
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.volume = 0;
        audioRef.current = null;
      }

      // Nettoyer le timer de mode manuel
      if (manualModeTimeoutRef.current) {
        clearTimeout(manualModeTimeoutRef.current);
      }

      console.log('🧹 CISCO: Nettoyage complet du AmbientSoundManager');
    };
  }, []);

  // Le composant ne rend rien - il gère seulement l'audio en arrière-plan
  return null;
};

export default AmbientSoundManager;
