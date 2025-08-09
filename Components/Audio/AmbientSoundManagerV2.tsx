import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// 🔧 CISCO: Nouveau système audio corrigé - correspondance exacte avec les dossiers
interface AmbientSoundManagerV2Props {
  skyMode: string;
  enabled?: boolean;
  volume?: number; // 0 to 1
}

// 🎵 Configuration des sons par mode - correspondance exacte avec les dossiers
const SOUND_CONFIG: Record<string, {
  sounds: string[]; // Plusieurs sons possibles par mode
  volume: number;
  folder: string;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  repeatDelay?: number; // 🔧 CISCO: Délai de répétition pour certains sons courts
}> = {
    // 🌙 Nuit profonde - 3 sons disponibles avec temporisation hibou
    night: {
      sounds: ['hibou-molkom.mp3', 'night-atmosphere-with-crickets-374652.mp3', 'sounds-crickets-nuit_profonde.mp3'],
      volume: 0.6,
      folder: 'nuit-profonde',
      fadeInDuration: 5000,
      fadeOutDuration: 5000,
      repeatDelay: 90000 // 🔧 CISCO: Temporisation 1.5 minute (90s) pour hibou-molkom.mp3
    },
    
    // 🌃 Crépuscule - 2 sons disponibles  
    dusk: { 
      sounds: ['cricket-single.mp3', 'merle-blackbird.mp3'], 
      volume: 0.4, 
      folder: 'crepuscule', 
      fadeInDuration: 5000, 
      fadeOutDuration: 5000 
    },
    
    // 🌅 Aube - 1 son disponible
    dawn: { 
      sounds: ['village_morning_birds_roosters.mp3'], 
      volume: 0.5, 
      folder: 'aube', 
      fadeInDuration: 5000, 
      fadeOutDuration: 5000 
    },
    
    // 🌄 Lever du soleil - 2 sons disponibles
    sunrise: {
      sounds: ['blackbird.mp3', 'Lever_soleil-nature.mp3'],
      volume: 0.4, // 🔧 CISCO: Volume réduit pour Lever_soleil-nature.mp3 qui est très fort
      folder: 'lever-soleil',
      fadeInDuration: 5000,
      fadeOutDuration: 5000
    },
    
    // 🌅 Matin - 2 sons disponibles
    morning: {
      sounds: ['insect_bee_fly.mp3', 'morning-birdsong.mp3'],
      volume: 0.7,
      folder: 'matin',
      fadeInDuration: 6000,
      fadeOutDuration: 6000,
      repeatDelay: 35000 // 🔧 CISCO: Temporisation 35s pour insect_bee_fly.mp3 (son court)
    },
    
    // ☀️ Midi - 2 sons disponibles
    midday: {
      sounds: ['forest_cicada.mp3', 'campagne-birds.mp3'],
      volume: 0.5,
      folder: 'midi',
      fadeInDuration: 4000,
      fadeOutDuration: 4000
    },
    
    // 🌞 Après-midi - 3 sons disponibles
    afternoon: {
      sounds: ['birds-singing.mp3', 'summer-insects-243572.mp3', 'village-moutons-apres-midi.mp3'],
      volume: 0.6,
      folder: 'apres-midi',
      fadeInDuration: 5000,
      fadeOutDuration: 5000
    },
    
    // 🌆 Coucher du soleil - 2 sons disponibles
    sunset: { 
      sounds: ['bird-chirp.mp3', 'grillon-drome.mp3'], 
      volume: 0.4, 
      folder: 'coucher-soleil', 
      fadeInDuration: 5000, 
      fadeOutDuration: 5000 
    },
};

// 🎵 Fonction pour construire l'URL du son
const getSoundUrl = (soundFile: string, folder: string): string => {
  return `/sounds/${folder}/${soundFile}`;
};

// 🔧 CISCO: Fonction getRandomSound supprimée - on joue TOUS les sons maintenant

const AmbientSoundManagerV2: React.FC<AmbientSoundManagerV2Props> = ({
  skyMode,
  enabled = true,
  volume = 1.0
}) => {
  // 🔧 CISCO: Changement pour gérer PLUSIEURS fichiers audio simultanément
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const fadeTweens = useRef<gsap.core.Tween[]>([]);
  const currentSoundKey = useRef<string | null>(null);
  const currentSoundFiles = useRef<string[]>([]);
  const repeatTimeouts = useRef<NodeJS.Timeout[]>([]); // 🔧 CISCO: Gestion des timeouts de répétition

  // 🔧 CISCO: useEffect séparé pour les changements de mode/enabled (sans volume)
  useEffect(() => {
    console.log(`🎵 AmbientSoundManagerV2: Mode=${skyMode}, Enabled=${enabled}`);

    const newSoundConfig = SOUND_CONFIG[skyMode];
    const newSoundKey = skyMode;

    // --- Audio Enabled/Disabled Logic ---
    if (!enabled) {
      if (audioRefs.current.length > 0) {
        console.log(`🔇 Audio désactivé. Arrêt de ${audioRefs.current.length} sons du mode ${currentSoundKey.current}.`);

        // Arrêter tous les tweens
        fadeTweens.current.forEach(tween => tween?.kill());
        fadeTweens.current = [];

        // 🔧 CISCO: Arrêter tous les timeouts de répétition
        repeatTimeouts.current.forEach(timeout => clearTimeout(timeout));
        repeatTimeouts.current = [];

        // Fade out et arrêt de tous les audios
        audioRefs.current.forEach((audio, index) => {
          if (audio) {
            gsap.to(audio, {
              volume: 0,
              duration: 1,
              onComplete: () => {
                audio.pause();
                console.log(`🔇 Audio ${index + 1} arrêté.`);
              }
            });
          }
        });

        // Nettoyer les références
        audioRefs.current = [];
        currentSoundKey.current = null;
        currentSoundFiles.current = [];
        console.log("🔇 Tous les audios arrêtés et nettoyés.");
      }
      return; // Arrêter ici si l'audio est désactivé
    }

    // --- Sound Change Logic ---
    if (enabled && newSoundKey !== currentSoundKey.current) {
      console.log(`🎵 Changement de mode: ${currentSoundKey.current} → ${newSoundKey}`);

      // 1. Fade out et arrêt de TOUS les anciens sons
      if (audioRefs.current.length > 0) {
        console.log(`🎵 Arrêt progressif de ${audioRefs.current.length} sons du mode ${currentSoundKey.current}`);

        // Arrêter tous les tweens en cours
        fadeTweens.current.forEach(tween => tween?.kill());
        fadeTweens.current = [];

        // Fade out de tous les audios
        audioRefs.current.forEach((audio, index) => {
          if (audio) {
            gsap.to(audio, {
              volume: 0,
              duration: newSoundConfig?.fadeOutDuration / 1000 || 2.0,
              ease: "power1.inOut",
              onComplete: () => {
                audio.pause();
                console.log(`🎵 Ancien son ${index + 1} (${currentSoundFiles.current[index]}) arrêté.`);
              }
            });
          }
        });
      }

      // 2. Démarrer TOUS les nouveaux sons si la configuration existe
      if (newSoundConfig && newSoundConfig.sounds.length > 0) {
        console.log(`🎵 Démarrage de ${newSoundConfig.sounds.length} sons du dossier ${newSoundConfig.folder}`);

        // Nettoyer les anciennes références
        audioRefs.current = [];
        fadeTweens.current = [];
        currentSoundKey.current = newSoundKey;
        currentSoundFiles.current = [...newSoundConfig.sounds];

        // Créer et jouer TOUS les fichiers du dossier
        newSoundConfig.sounds.forEach((soundFile, index) => {
          const soundUrl = getSoundUrl(soundFile, newSoundConfig.folder);
          console.log(`🎵 Chargement son ${index + 1}/${newSoundConfig.sounds.length}: ${soundFile}`);

          const newAudio = new Audio(soundUrl);

          // 🔧 CISCO: Gestion spéciale pour les sons courts avec temporisation
          if ((soundFile === 'insect_bee_fly.mp3' || soundFile === 'hibou-molkom.mp3') && newSoundConfig.repeatDelay) {
            newAudio.loop = false; // Pas de loop automatique pour les sons avec temporisation
            console.log(`🔄 Son avec temporisation détecté: ${soundFile} (délai: ${newSoundConfig.repeatDelay}ms)`);
          } else {
            newAudio.loop = true; // Loop normal pour les autres sons
          }

          newAudio.volume = 0; // Commencer silencieux pour le fade in
          audioRefs.current.push(newAudio);

          // Jouer puis faire le fade in
          newAudio.play().then(() => {
            console.log(`🎵 Fade in du son ${index + 1}: ${soundFile}`);
            const targetVolume = newSoundConfig.volume * volume;
            const tween = gsap.to(newAudio, {
              volume: targetVolume,
              duration: newSoundConfig.fadeInDuration / 1000 || 2.0,
              ease: "power1.inOut",
            });
            fadeTweens.current.push(tween);

            // 🔧 CISCO: Gestion spécialisée pour le hibou en mode nuit profonde
            if (soundFile === 'hibou-molkom.mp3' && newSoundConfig.repeatDelay) {
              const setupOwlRepeat = () => {
                // 🦉 CISCO: Délai variable entre 1 et 2 minutes pour naturalisme
                const randomDelay = 60000 + Math.random() * 60000; // Entre 60s et 120s

                const timeout = setTimeout(() => {
                  if (audioRefs.current.includes(newAudio) && enabled && skyMode === 'night') {
                    newAudio.currentTime = 0;
                    newAudio.play().then(() => {
                      console.log(`🦉 Hibou répété après ${Math.round(randomDelay/1000)}s`);
                      setupOwlRepeat(); // Programmer la prochaine répétition avec nouveau délai aléatoire
                    }).catch(error => {
                      console.error(`❌ Erreur répétition hibou:`, error);
                    });
                  }
                }, randomDelay);
                repeatTimeouts.current.push(timeout);
              };

              // Programmer la première répétition après la fin du son initial
              newAudio.addEventListener('ended', setupOwlRepeat);
              console.log(`🦉 Temporisation hibou activée - répétition toutes les 1-2 minutes`);

            } else if (soundFile === 'insect_bee_fly.mp3' && newSoundConfig.repeatDelay) {
              // 🐝 CISCO: Gestion normale pour les autres sons courts
              const setupRepeat = () => {
                const timeout = setTimeout(() => {
                  if (audioRefs.current.includes(newAudio) && enabled) {
                    newAudio.currentTime = 0;
                    newAudio.play().then(() => {
                      console.log(`🔄 Répétition du son: ${soundFile}`);
                      setupRepeat(); // Programmer la prochaine répétition
                    }).catch(error => {
                      console.error(`❌ Erreur répétition ${soundFile}:`, error);
                    });
                  }
                }, newSoundConfig.repeatDelay);
                repeatTimeouts.current.push(timeout);
              };

              // Programmer la première répétition après la fin du son
              newAudio.addEventListener('ended', setupRepeat);
            }
          }).catch(error => {
            console.error(`❌ Erreur lors de la lecture du son ${soundUrl}:`, error);
            // Retirer ce son défaillant de la liste
            const audioIndex = audioRefs.current.indexOf(newAudio);
            if (audioIndex > -1) {
              audioRefs.current.splice(audioIndex, 1);
            }
          });
        });
      } else {
        // Si le nouveau mode n'a pas de son, s'assurer qu'on est silencieux
        console.log(`🔇 Aucun son configuré pour le mode: ${newSoundKey}`);
        audioRefs.current = [];
        currentSoundKey.current = newSoundKey;
        currentSoundFiles.current = [];
      }
    }

    // --- Cleanup on unmount ---
    return () => {
      console.log("🧹 Nettoyage AmbientSoundManagerV2 au démontage.");

      // Arrêter tous les tweens
      fadeTweens.current.forEach(tween => tween?.kill());
      fadeTweens.current = [];

      // 🔧 CISCO: Arrêter tous les timeouts de répétition
      repeatTimeouts.current.forEach(timeout => clearTimeout(timeout));
      repeatTimeouts.current = [];

      // Arrêter et nettoyer tous les audios
      audioRefs.current.forEach((audio, index) => {
        if (audio) {
          audio.pause();
          console.log(`🧹 Audio ${index + 1} nettoyé.`);
        }
      });
      audioRefs.current = [];
      currentSoundFiles.current = [];
    };
  }, [skyMode, enabled]); // 🔧 CISCO: VOLUME RETIRÉ des dépendances !

  // 🔧 CISCO: useEffect séparé UNIQUEMENT pour les changements de volume
  useEffect(() => {
    // Ne rien faire si pas d'audio actif ou pas activé
    if (audioRefs.current.length === 0 || !enabled) return;

    const currentSoundConfig = SOUND_CONFIG[currentSoundKey.current || ''];
    if (!currentSoundConfig) return;

    const targetVolume = currentSoundConfig.volume * volume;
    console.log(`🔊 Ajustement du volume UNIQUEMENT pour ${audioRefs.current.length} sons: ${targetVolume.toFixed(2)}`);

    // Arrêter toutes les animations de volume en cours
    fadeTweens.current.forEach(tween => tween?.kill());
    fadeTweens.current = [];

    // Ajustement du volume pour TOUS les audios
    audioRefs.current.forEach((audio, index) => {
      if (audio) {
        const tween = gsap.to(audio, {
          volume: targetVolume,
          duration: 0.3, // Très rapide pour réactivité du slider
          ease: "power1.out",
        });
        fadeTweens.current.push(tween);
      }
    });
  }, [volume, enabled]); // Seulement volume et enabled

  return null; // Ce composant ne rend rien visuellement
};

export default AmbientSoundManagerV2;
