import React, { createContext, useContext, ReactNode } from 'react';

interface TimeContextType {
  getCurrentTime: () => Date;
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
  const getCurrentTime = (): Date => {
    return new Date();
  };

  return (
    <TimeContext.Provider value={{ getCurrentTime }}>
      {children}
    </TimeContext.Provider>
  );
};
