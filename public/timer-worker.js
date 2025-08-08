// 🔄 Web Worker pour maintenir le timer en arrière-plan
// Ce worker continue de fonctionner même quand l'onglet n'est pas visible

let timerState = {
  isRunning: false,
  startTime: 0,
  elapsedTime: 0,
  pausedTime: 0,
  type: 'stopwatch', // 'stopwatch' ou 'countdown'
  countdownDuration: 0,
  remainingTime: 0
};

let intervalId = null;

// 🎯 Fonction pour démarrer le timer
const startTimer = (data) => {
  timerState.isRunning = true;
  timerState.startTime = Date.now() - timerState.elapsedTime;
  timerState.type = data.type || 'stopwatch';
  
  if (data.type === 'countdown') {
    timerState.countdownDuration = data.duration || 0;
    timerState.remainingTime = data.duration || 0;
    timerState.startTime = Date.now();
  }

  // 🔄 Intervalle de mise à jour (toutes les 100ms pour la précision)
  intervalId = setInterval(() => {
    if (timerState.isRunning) {
      const now = Date.now();
      
      if (timerState.type === 'stopwatch') {
        // ⏱️ Mode chronomètre
        timerState.elapsedTime = now - timerState.startTime;
        
        self.postMessage({
          type: 'timer_update',
          elapsedTime: timerState.elapsedTime,
          status: 'running'
        });
        
      } else if (timerState.type === 'countdown') {
        // ⏰ Mode compte à rebours
        const elapsed = now - timerState.startTime;
        timerState.remainingTime = Math.max(0, timerState.countdownDuration - elapsed);
        
        self.postMessage({
          type: 'countdown_update',
          remainingTime: timerState.remainingTime,
          status: timerState.remainingTime > 0 ? 'running' : 'finished'
        });
        
        // 🔔 Fin du compte à rebours
        if (timerState.remainingTime <= 0) {
          timerState.isRunning = false;
          clearInterval(intervalId);
          intervalId = null;
          
          self.postMessage({
            type: 'countdown_finished',
            message: 'Compte à rebours terminé !'
          });
        }
      }
    }
  }, 100); // Mise à jour toutes les 100ms

  console.log(`🔄 Worker: Timer démarré (${timerState.type})`);
};

// ⏸️ Fonction pour mettre en pause
const pauseTimer = () => {
  if (timerState.isRunning && intervalId) {
    timerState.isRunning = false;
    timerState.pausedTime = Date.now();
    clearInterval(intervalId);
    intervalId = null;
    
    self.postMessage({
      type: 'timer_paused',
      elapsedTime: timerState.elapsedTime,
      remainingTime: timerState.remainingTime
    });
    
    console.log('⏸️ Worker: Timer mis en pause');
  }
};

// ▶️ Fonction pour reprendre
const resumeTimer = () => {
  if (!timerState.isRunning) {
    const pausedDuration = Date.now() - timerState.pausedTime;
    timerState.startTime += pausedDuration;
    startTimer({ type: timerState.type, duration: timerState.remainingTime });
    
    console.log('▶️ Worker: Timer repris');
  }
};

// ⏹️ Fonction pour arrêter
const stopTimer = () => {
  timerState.isRunning = false;
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  
  const finalTime = timerState.type === 'stopwatch' ? timerState.elapsedTime : timerState.countdownDuration;
  
  self.postMessage({
    type: 'timer_stopped',
    finalTime: finalTime,
    elapsedTime: timerState.elapsedTime
  });
  
  // 🔄 Reset de l'état
  timerState = {
    isRunning: false,
    startTime: 0,
    elapsedTime: 0,
    pausedTime: 0,
    type: 'stopwatch',
    countdownDuration: 0,
    remainingTime: 0
  };
  
  console.log('⏹️ Worker: Timer arrêté et reset');
};

// 📊 Fonction pour obtenir le statut
const getStatus = () => {
  self.postMessage({
    type: 'timer_status',
    state: timerState,
    isRunning: timerState.isRunning
  });
};

// 🎯 Gestionnaire des messages du thread principal
self.onmessage = function(e) {
  const { type, data } = e.data;
  
  switch (type) {
    case 'start':
      startTimer(data);
      break;
      
    case 'pause':
      pauseTimer();
      break;
      
    case 'resume':
      resumeTimer();
      break;
      
    case 'stop':
      stopTimer();
      break;
      
    case 'get_status':
      getStatus();
      break;
      
    default:
      console.warn(`🔄 Worker: Type de message inconnu: ${type}`);
  }
};

// 🚀 Message de démarrage
self.postMessage({
  type: 'worker_ready',
  message: 'Timer Worker initialisé et prêt'
});

console.log('🔄 Timer Worker démarré et opérationnel');
