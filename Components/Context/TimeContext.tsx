import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';

interface TimeContextType {
  getCurrentTime: () => Date;
  setSimulatedTime: (time: Date | null) => void;
  isSimulating: boolean;
  simulatedTime: Date | null;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const useTime = () => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};

interface TimeProviderProps {
  children: ReactNode;
}

export const TimeProvider: React.FC<TimeProviderProps> = ({ children }) => {
  const [simulatedTime, setSimulatedTime] = useState<Date | null>(null);

  // Mémoïse pour stabilité des références dans les dépendances de useEffect
  const getCurrentTime = useCallback((): Date => {
    return simulatedTime || new Date();
  }, [simulatedTime]);

  const handleSetSimulatedTime = (time: Date | null) => {
    setSimulatedTime(time);
  };

  const isSimulating = simulatedTime !== null;

  return (
    <TimeContext.Provider value={{
      getCurrentTime,
      setSimulatedTime: handleSetSimulatedTime,
      isSimulating,
      simulatedTime
    }}>
      {children}
    </TimeContext.Provider>
  );
};
