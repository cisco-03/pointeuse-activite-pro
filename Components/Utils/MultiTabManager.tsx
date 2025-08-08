import React, { useEffect, useRef, useState, useCallback } from 'react';

// 🔄 Types pour la gestion multi-onglets
interface TabState {
  isVisible: boolean;
  lastActiveTime: number;
  workingUrl?: string;
}

interface MultiTabManagerProps {
  onVisibilityChange: (isVisible: boolean) => void;
  onWorkingUrlChange?: (url: string) => void;
  enabled: boolean;
}

// 🎯 Interface pour la position du widget
interface WidgetPosition {
  x: number;
  y: number;
}

// 🌐 Hook pour la gestion multi-onglets
export const useMultiTabManager = (enabled: boolean = true) => {
  const [isTabVisible, setIsTabVisible] = useState(true);
  const [workingUrl, setWorkingUrl] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const lastActiveTimeRef = useRef(Date.now());
  const visibilityCallbackRef = useRef<((visible: boolean) => void) | null>(null);

  // 👁️ Détection de visibilité de l'onglet
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      const isVisible = !document.hidden;
      setIsTabVisible(isVisible);
      
      if (isVisible) {
        lastActiveTimeRef.current = Date.now();
        console.log('👁️ Onglet redevenu visible - Timer peut reprendre');
      } else {
        console.log('👁️ Onglet masqué - Timer continue en arrière-plan');
      }

      // Appeler le callback si défini
      if (visibilityCallbackRef.current) {
        visibilityCallbackRef.current(isVisible);
      }
    };

    // 🎯 Événements de visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', () => handleVisibilityChange());
    window.addEventListener('blur', () => handleVisibilityChange());

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      window.removeEventListener('blur', handleVisibilityChange);
    };
  }, [enabled]);

  // 🔔 Notifications pour onglet inactif
  const showTabNotification = (title: string, message: string) => {
    if (!isTabVisible && 'Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        tag: 'tab-notification',
        requireInteraction: false
      });

      // Focus sur l'onglet quand on clique sur la notification
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      // Fermer après 5 secondes
      setTimeout(() => notification.close(), 5000);
    }
  };

  // 📝 Gestion de l'URL de travail
  const updateWorkingUrl = (url: string) => {
    setWorkingUrl(url);
    localStorage.setItem('timetracker_working_url', url);
    console.log(`🔗 URL de travail mise à jour: ${url}`);
  };

  // 💾 Charger l'URL sauvegardée
  useEffect(() => {
    const savedUrl = localStorage.getItem('timetracker_working_url');
    if (savedUrl) {
      setWorkingUrl(savedUrl);
    }
  }, []);

  // 🎯 Fonction pour définir le callback de visibilité
  const setVisibilityCallback = (callback: (visible: boolean) => void) => {
    visibilityCallbackRef.current = callback;
  };

  return {
    isTabVisible,
    workingUrl,
    showUrlInput,
    setShowUrlInput,
    updateWorkingUrl,
    showTabNotification,
    setVisibilityCallback,
    lastActiveTime: lastActiveTimeRef.current
  };
};

// 🎛️ Composant d'interface pour la gestion multi-onglets
const MultiTabManager: React.FC<MultiTabManagerProps> = ({
  onVisibilityChange,
  onWorkingUrlChange,
  enabled
}) => {
  const {
    isTabVisible,
    workingUrl,
    showUrlInput,
    setShowUrlInput,
    updateWorkingUrl,
    setVisibilityCallback
  } = useMultiTabManager(enabled);

  const [tempUrl, setTempUrl] = useState(workingUrl);

  // 🎯 États pour le drag & drop
  const [position, setPosition] = useState<WidgetPosition>({ x: 16, y: 16 }); // Position par défaut (top-4 right-4)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  // 🔗 Configurer le callback de visibilité
  useEffect(() => {
    setVisibilityCallback(onVisibilityChange);
  }, [onVisibilityChange, setVisibilityCallback]);

  // 💾 Charger la position sauvegardée
  useEffect(() => {
    const savedPosition = localStorage.getItem('multitab_widget_position');
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition);
        setPosition(parsed);
      } catch (error) {
        console.warn('🔧 Erreur chargement position widget:', error);
      }
    }
  }, []);

  // 💾 Sauvegarder la position
  const savePosition = useCallback((newPosition: WidgetPosition) => {
    localStorage.setItem('multitab_widget_position', JSON.stringify(newPosition));
  }, []);

  // 🎯 Gestionnaires de drag & drop
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!widgetRef.current) return;

    const rect = widgetRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);

    // Empêcher la sélection de texte pendant le drag
    e.preventDefault();
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    };

    // Limites de l'écran (avec marge de sécurité)
    const maxX = window.innerWidth - 320; // 320px = largeur approximative du widget
    const maxY = window.innerHeight - 200; // 200px = hauteur approximative du widget

    newPosition.x = Math.max(0, Math.min(newPosition.x, maxX));
    newPosition.y = Math.max(0, Math.min(newPosition.y, maxY));

    setPosition(newPosition);
  }, [isDragging, dragOffset]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      savePosition(position);
    }
  }, [isDragging, position, savePosition]);

  // 🎯 Événements globaux pour le drag & drop
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // 📝 Gérer les changements d'URL
  const handleUrlSubmit = () => {
    updateWorkingUrl(tempUrl);
    if (onWorkingUrlChange) {
      onWorkingUrlChange(tempUrl);
    }
    setShowUrlInput(false);
  };

  const handleUrlCancel = () => {
    setTempUrl(workingUrl);
    setShowUrlInput(false);
  };

  if (!enabled) return null;

  return (
    <div
      ref={widgetRef}
      className={`fixed z-50 bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 border border-gray-600 max-w-md transition-shadow ${
        isDragging ? 'shadow-2xl cursor-grabbing' : 'shadow-lg cursor-grab'
      }`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        userSelect: 'none' // Empêcher la sélection pendant le drag
      }}
      onMouseDown={handleMouseDown}
    >
      {/* 🎯 Handle de déplacement + Indicateur de statut */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isTabVisible ? 'bg-green-500' : 'bg-orange-500'}`}></div>
          <span className="text-sm text-gray-300">
            {isTabVisible ? '👁️ Onglet actif' : '🔄 Arrière-plan'}
          </span>
        </div>
        {/* 🎯 Icône de déplacement */}
        <div className="text-gray-400 text-xs cursor-grab hover:text-gray-300 transition-colors" title="Glisser pour déplacer">
          ⋮⋮
        </div>
      </div>

      {/* 🔗 Gestion URL de travail */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">URL de travail :</span>
          <button
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="text-xs bg-teal-600 hover:bg-teal-700 px-2 py-1 rounded"
          >
            {showUrlInput ? '❌' : '⚙️'}
          </button>
        </div>

        {workingUrl && !showUrlInput && (
          <div className="text-xs text-teal-400 truncate" title={workingUrl}>
            🔗 {workingUrl}
          </div>
        )}

        {showUrlInput && (
          <div className="space-y-2">
            <input
              type="text"
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              placeholder="https://localhost:3000 ou URL de travail"
              className="w-full text-xs bg-gray-700 border border-gray-600 rounded px-2 py-1 text-gray-200"
            />
            <div className="flex gap-2">
              <button
                onClick={handleUrlSubmit}
                className="flex-1 text-xs bg-green-600 hover:bg-green-700 px-2 py-1 rounded"
              >
                ✅ Sauver
              </button>
              <button
                onClick={handleUrlCancel}
                className="flex-1 text-xs bg-gray-600 hover:bg-gray-700 px-2 py-1 rounded"
              >
                ❌ Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 💡 Aide contextuelle */}
      <div className="mt-2 text-xs text-gray-500">
        💡 Le timer continue même si vous changez d'onglet
        <br />
        🎯 Glissez-déposez pour déplacer ce widget
      </div>
    </div>
  );
};

export default MultiTabManager;
