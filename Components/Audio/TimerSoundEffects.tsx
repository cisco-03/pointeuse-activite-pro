import React, { useRef, useEffect } from 'react';

// 🔊 Types d'événements sonores du timer
type TimerSoundEvent = 'start' | 'pause' | 'resume' | 'stop' | 'countdown_finish';

// 🎵 Configuration des effets sonores
interface SoundEffect {
  frequency: number;
  duration: number;
  volume: number;
  type: OscillatorType;
}

// 🎼 Configuration des sons par événement
const TIMER_SOUND_CONFIG: Record<TimerSoundEvent, SoundEffect[]> = {
  // ▶️ Démarrage du chronomètre - Son doux et encourageant
  start: [
    { frequency: 800, duration: 0.15, volume: 0.3, type: 'sine' },
    { frequency: 1000, duration: 0.15, volume: 0.25, type: 'sine' }
  ],
  
  // ⏸️ Pause - Son neutre et court
  pause: [
    { frequency: 600, duration: 0.1, volume: 0.2, type: 'sine' }
  ],
  
  // ▶️ Reprise - Son similaire au démarrage mais plus court
  resume: [
    { frequency: 900, duration: 0.1, volume: 0.25, type: 'sine' }
  ],
  
  // ⏹️ Arrêt - Son de confirmation
  stop: [
    { frequency: 700, duration: 0.12, volume: 0.2, type: 'sine' },
    { frequency: 500, duration: 0.15, volume: 0.15, type: 'sine' }
  ],
  
  // 🔔 Fin de compte à rebours - Séquence d'alerte progressive
  countdown_finish: [
    { frequency: 800, duration: 0.2, volume: 0.3, type: 'sine' },
    { frequency: 1000, duration: 0.2, volume: 0.3, type: 'sine' },
    { frequency: 1200, duration: 0.3, volume: 0.35, type: 'sine' }
  ]
};

// 🎚️ Props du composant
interface TimerSoundEffectsProps {
  enabled: boolean;
  volume: number; // 0-1
}

// 🔊 Hook pour les effets sonores du timer
export const useTimerSounds = (enabled: boolean, volume: number) => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // 🎵 Initialiser le contexte audio
  useEffect(() => {
    if (enabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('🔇 Web Audio API non supportée:', error);
      }
    }
  }, [enabled]);

  // 🎼 Fonction pour jouer un effet sonore
  const playTimerSound = (event: TimerSoundEvent) => {
    if (!enabled || !audioContextRef.current || volume === 0) return;

    const soundEffects = TIMER_SOUND_CONFIG[event];
    const audioContext = audioContextRef.current;

    // 🔊 Jouer chaque effet de la séquence
    soundEffects.forEach((effect, index) => {
      const delay = index * 300; // 300ms entre chaque son
      
      setTimeout(() => {
        try {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          // 🔗 Connexions audio
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          // ⚙️ Configuration de l'oscillateur
          oscillator.frequency.value = effect.frequency;
          oscillator.type = effect.type;

          // 🎚️ Configuration du volume avec fade-out
          const finalVolume = effect.volume * volume;
          gainNode.gain.setValueAtTime(finalVolume, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + effect.duration);

          // ▶️ Lecture
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + effect.duration);

          console.log(`🔊 Son timer joué: ${event} (${effect.frequency}Hz, ${effect.duration}s)`);
        } catch (error) {
          console.warn(`🔇 Erreur lecture son ${event}:`, error);
        }
      }, delay);
    });
  };

  // 🧹 Nettoyage du contexte audio
  useEffect(() => {
    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  return { playTimerSound };
};

// 🎵 Composant React pour les effets sonores du timer
const TimerSoundEffects: React.FC<TimerSoundEffectsProps> = ({ enabled, volume }) => {
  const { playTimerSound } = useTimerSounds(enabled, volume);

  // 🌐 Exposer la fonction globalement pour utilisation dans App.tsx
  useEffect(() => {
    (window as any).playTimerSound = playTimerSound;
    
    return () => {
      delete (window as any).playTimerSound;
    };
  }, [playTimerSound]);

  // 🎯 Ce composant n'a pas de rendu visuel
  return null;
};

export default TimerSoundEffects;
export type { TimerSoundEvent };
