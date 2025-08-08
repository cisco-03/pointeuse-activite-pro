import { useEffect, useRef, useState, useCallback } from 'react';

// 🔄 Types pour le timer en arrière-plan
type TimerStatus = 'stopped' | 'running' | 'paused';
type TimerType = 'stopwatch' | 'countdown';

interface BackgroundTimerState {
  elapsedTime: number;
  remainingTime: number;
  status: TimerStatus;
  type: TimerType;
}

interface UseBackgroundTimerProps {
  onStop?: (elapsedTime: number) => void;
  onCountdownFinish?: () => void;
  enabled?: boolean;
}

// 🔄 Hook pour timer en arrière-plan avec Web Worker
export const useBackgroundTimer = ({
  onStop,
  onCountdownFinish,
  enabled = true
}: UseBackgroundTimerProps = {}) => {
  const workerRef = useRef<Worker | null>(null);
  const [state, setState] = useState<BackgroundTimerState>({
    elapsedTime: 0,
    remainingTime: 0,
    status: 'stopped',
    type: 'stopwatch'
  });

  // 🚀 Initialisation du Web Worker
  useEffect(() => {
    if (!enabled) return;

    try {
      workerRef.current = new Worker('/timer-worker.js');
      
      // 📨 Gestionnaire des messages du worker
      workerRef.current.onmessage = (e) => {
        const { type, elapsedTime, remainingTime, status, finalTime } = e.data;
        
        switch (type) {
          case 'worker_ready':
            console.log('🔄 Background Timer Worker prêt');
            break;
            
          case 'timer_update':
            setState(prev => ({
              ...prev,
              elapsedTime: elapsedTime || 0,
              status: status || 'running'
            }));
            break;
            
          case 'countdown_update':
            setState(prev => ({
              ...prev,
              remainingTime: remainingTime || 0,
              status: status || 'running'
            }));
            break;
            
          case 'countdown_finished':
            setState(prev => ({
              ...prev,
              status: 'stopped',
              remainingTime: 0
            }));
            if (onCountdownFinish) {
              onCountdownFinish();
            }
            break;
            
          case 'timer_paused':
            setState(prev => ({
              ...prev,
              status: 'paused',
              elapsedTime: elapsedTime || prev.elapsedTime,
              remainingTime: remainingTime || prev.remainingTime
            }));
            break;
            
          case 'timer_stopped':
            setState(prev => ({
              ...prev,
              status: 'stopped',
              elapsedTime: 0,
              remainingTime: 0
            }));
            if (onStop && finalTime !== undefined) {
              onStop(finalTime);
            }
            break;
            
          default:
            console.log(`🔄 Message worker: ${type}`, e.data);
        }
      };

      // ❌ Gestion des erreurs
      workerRef.current.onerror = (error) => {
        console.error('❌ Erreur Web Worker:', error);
      };

    } catch (error) {
      console.error('❌ Impossible de créer le Web Worker:', error);
    }

    // 🧹 Nettoyage
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [enabled, onStop, onCountdownFinish]);

  // 🎯 Fonction pour envoyer des messages au worker
  const sendMessage = useCallback((type: string, data?: any) => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type, data });
    }
  }, []);

  // ▶️ Démarrer le chronomètre
  const startStopwatch = useCallback(() => {
    setState(prev => ({ ...prev, type: 'stopwatch', status: 'running' }));
    sendMessage('start', { type: 'stopwatch' });
    
    // 🔊 Son de démarrage
    if (typeof (window as any).playTimerSound === 'function') {
      (window as any).playTimerSound('start');
    }
  }, [sendMessage]);

  // ⏰ Démarrer le compte à rebours
  const startCountdown = useCallback((durationMs: number) => {
    setState(prev => ({ 
      ...prev, 
      type: 'countdown', 
      status: 'running',
      remainingTime: durationMs 
    }));
    sendMessage('start', { type: 'countdown', duration: durationMs });
    
    // 🔊 Son de démarrage
    if (typeof (window as any).playTimerSound === 'function') {
      (window as any).playTimerSound('start');
    }
  }, [sendMessage]);

  // ⏸️ Mettre en pause
  const pause = useCallback(() => {
    setState(prev => ({ ...prev, status: 'paused' }));
    sendMessage('pause');
    
    // 🔊 Son de pause
    if (typeof (window as any).playTimerSound === 'function') {
      (window as any).playTimerSound('pause');
    }
  }, [sendMessage]);

  // ▶️ Reprendre
  const resume = useCallback(() => {
    setState(prev => ({ ...prev, status: 'running' }));
    sendMessage('resume');
    
    // 🔊 Son de reprise
    if (typeof (window as any).playTimerSound === 'function') {
      (window as any).playTimerSound('resume');
    }
  }, [sendMessage]);

  // ⏹️ Arrêter
  const stop = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      status: 'stopped', 
      elapsedTime: 0, 
      remainingTime: 0 
    }));
    sendMessage('stop');
    
    // 🔊 Son d'arrêt
    if (typeof (window as any).playTimerSound === 'function') {
      (window as any).playTimerSound('stop');
    }
  }, [sendMessage]);

  // 📊 Obtenir le statut
  const getStatus = useCallback(() => {
    sendMessage('get_status');
  }, [sendMessage]);

  // 🔄 Pause forcée (pour compatibilité avec l'ancien système)
  const forcePause = useCallback(() => {
    if (state.status === 'running') {
      pause();
    }
  }, [state.status, pause]);

  return {
    // État
    elapsedTime: state.elapsedTime,
    remainingTime: state.remainingTime,
    status: state.status,
    type: state.type,
    
    // Actions
    startStopwatch,
    startCountdown,
    pause,
    resume,
    stop,
    forcePause,
    getStatus,
    
    // Utilitaires
    isWorkerSupported: !!workerRef.current
  };
};
