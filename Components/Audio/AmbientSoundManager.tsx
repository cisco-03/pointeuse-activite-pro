import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

// Types and configuration can remain similar, they are well-structured.
type AmbientSoundType =
  | 'hibou-molkom' | 'night-atmosphere-with-crickets-374652'
  | 'village_morning_birds_roosters'
  | 'blackbird'
  | 'insect_bee_fly' | 'morning-birdsong'
  | 'forest_cicada'
  | 'birds-singing' | 'summer-insects-243572'
  | 'bird-chirp' | 'grillon-drome'
  | 'cricket-single' | 'merle-blackbird'
  | 'none';

interface AmbientSoundManagerProps {
  skyMode: string;
  enabled?: boolean;
  volume?: number; // 0 to 1
}

const SOUND_CONFIG: Record<string, {
  sound: AmbientSoundType;
  volume: number;
  folder: string;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}> = {
    night: { sound: 'night-atmosphere-with-crickets-374652', volume: 0.6, folder: 'nuit-profonde', fadeInDuration: 5000, fadeOutDuration: 5000 },
    dusk: { sound: 'merle-blackbird', volume: 0.4, folder: 'crepuscule', fadeInDuration: 5000, fadeOutDuration: 5000 },
    dawn: { sound: 'village_morning_birds_roosters', volume: 0.5, folder: 'aube', fadeInDuration: 5000, fadeOutDuration: 5000 },
    sunrise: { sound: 'blackbird', volume: 0.6, folder: 'lever-soleil', fadeInDuration: 5000, fadeOutDuration: 5000 },
    morning: { sound: 'morning-birdsong', volume: 0.7, folder: 'matin', fadeInDuration: 6000, fadeOutDuration: 6000 },
    midday: { sound: 'forest_cicada', volume: 0.3, folder: 'midi', fadeInDuration: 5000, fadeOutDuration: 5000 },
    afternoon: { sound: 'summer-insects-243572', volume: 0.4, folder: 'apres-midi', fadeInDuration: 5000, fadeOutDuration: 5000 },
    sunset: { sound: 'grillon-drome', volume: 0.4, folder: 'coucher-soleil', fadeInDuration: 5000, fadeOutDuration: 5000 },
};

const getSoundUrl = (soundType: AmbientSoundType, folder?: string): string => {
  if (soundType === 'none' || !folder) return '';
  return `/sounds/${folder}/${soundType}.mp3`;
};

const AmbientSoundManager: React.FC<AmbientSoundManagerProps> = ({
  skyMode,
  enabled = false,
  volume = 0.5
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentSoundKey = useRef<string | null>(null); // To track the current sound playing (e.g., "night")
  const fadeTween = useRef<gsap.core.Tween | null>(null);

  useEffect(() => {
    const newSoundConfig = SOUND_CONFIG[skyMode];
    const newSoundKey = skyMode;

    // --- Audio Enabled/Disabled Logic ---
    if (!enabled) {
      if (audioRef.current) {
        console.log(`🔇 Audio disabled. Fading out ${currentSoundKey.current}.`);
        if (fadeTween.current) fadeTween.current.kill();
        fadeTween.current = gsap.to(audioRef.current, {
          volume: 0,
          duration: 1, // Quick fade out
          onComplete: () => {
            audioRef.current?.pause();
            audioRef.current = null;
            currentSoundKey.current = null;
            console.log("🔇 Audio stopped and cleaned up.");
          }
        });
      }
      return; // Stop here if audio is disabled
    }

    // --- Sound Change Logic ---
    if (enabled && newSoundKey !== currentSoundKey.current) {
      // 1. Fade out the old sound if it exists
      const oldAudio = audioRef.current;
      if (oldAudio) {
        console.log(`🎵 Fading out old sound: ${currentSoundKey.current}`);
        if (fadeTween.current) fadeTween.current.kill();
        fadeTween.current = gsap.to(oldAudio, {
          volume: 0,
          duration: newSoundConfig?.fadeOutDuration / 1000 || 2.0,
          ease: "power1.inOut",
          onComplete: () => {
            oldAudio.pause();
            console.log(`🎵 Old sound ${currentSoundKey.current} stopped.`);
          }
        });
      }

      // 2. Create and fade in the new sound
      if (newSoundConfig && newSoundConfig.sound !== 'none') {
        currentSoundKey.current = newSoundKey;
        const soundUrl = getSoundUrl(newSoundConfig.sound, newSoundConfig.folder);
        console.log(`🎵 Creating new sound: ${newSoundKey} from ${soundUrl}`);

        const newAudio = new Audio(soundUrl);
        newAudio.loop = true;
        newAudio.volume = 0; // Start at 0 volume
        audioRef.current = newAudio;

        // Play and then fade in
        newAudio.play().then(() => {
            console.log(`🎵 Fading in new sound: ${newSoundKey}`);
            if (fadeTween.current) fadeTween.current.kill();
            const targetVolume = newSoundConfig.volume * volume;
            fadeTween.current = gsap.to(newAudio, {
                volume: targetVolume,
                duration: newSoundConfig.fadeInDuration / 1000 || 2.0,
                ease: "power1.inOut",
            });
        }).catch(error => {
            console.error(`❌ Error playing sound ${soundUrl}:`, error);
            audioRef.current = null;
            currentSoundKey.current = null;
        });
      } else {
        // If the new mode has no sound, ensure we are silent.
        currentSoundKey.current = 'none';
        audioRef.current = null;
      }
    }

    // --- Volume Adjustment Logic ---
    if (audioRef.current && enabled && newSoundKey === currentSoundKey.current) {
        const targetVolume = (newSoundConfig?.volume || 0) * volume;
        if (fadeTween.current) fadeTween.current.kill();
        fadeTween.current = gsap.to(audioRef.current, {
            volume: targetVolume,
            duration: 1.0, // Smoothly adjust volume over 1 second
            ease: "power1.inOut",
        });
    }

    // --- Cleanup on unmount ---
    return () => {
      console.log("🧹 Cleaning up AmbientSoundManager on unmount.");
      if (fadeTween.current) fadeTween.current.kill();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [skyMode, enabled, volume]); // React to changes in these props

  return null; // This component does not render anything
};

export default AmbientSoundManager;
