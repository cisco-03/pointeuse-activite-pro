import React from 'react';
import TimeSimulator from './TimeSimulator';
import AudioControlPanel from '../Audio/AudioControlPanel';

interface ControlButtonsWrapperProps {
  // Props pour TimeSimulator
  onTimeChange: (simulatedTime: Date) => void;
  currentSimulatedTime: Date;

  // Props pour AudioControlPanel
  audioEnabled: boolean;
  audioVolume: number;
  onToggleEnabled: (enabled: boolean) => void;
  onVolumeChange: (volume: number) => void;
}

const ControlButtonsWrapper: React.FC<ControlButtonsWrapperProps> = ({
  onTimeChange,
  currentSimulatedTime,
  audioEnabled,
  audioVolume,
  onToggleEnabled,
  onVolumeChange
}) => {
  return (
    <>
      {/* Conteneur flexbox pour les boutons en bas */}
      <div className="fixed bottom-4 left-4 right-4 flex justify-between items-end z-40 pointer-events-none">
        {/* Bouton contrôle arrière-plan à gauche */}
        <div className="pointer-events-auto">
          <TimeSimulator 
            onTimeChange={onTimeChange}
            currentSimulatedTime={currentSimulatedTime}
          />
        </div>
        
        {/* Bouton audio à droite */}
        <div className="pointer-events-auto">
          <AudioControlPanel
            enabled={audioEnabled}
            volume={audioVolume}
            onToggleEnabled={onToggleEnabled}
            onVolumeChange={onVolumeChange}
          />
        </div>
      </div>
    </>
  );
};

export default ControlButtonsWrapper;
