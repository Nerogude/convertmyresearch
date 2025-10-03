import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }) => {
  const [currentProgress, setCurrentProgress] = useState(null);
  const [clientStatus, setClientStatus] = useState(50);
  const [wellbeing, setWellbeing] = useState(50);
  const [currentScenario, setCurrentScenario] = useState(null);
  const [showCarePlan, setShowCarePlan] = useState(false);
  const [decisionHistory, setDecisionHistory] = useState([]);

  const startScenario = (scenario, progressData) => {
    setCurrentScenario(scenario);
    setCurrentProgress(progressData);
    setClientStatus(progressData.clientStatus);
    setWellbeing(progressData.wellbeing);
    setDecisionHistory([]);
  };

  const updateMeters = (newClientStatus, newWellbeing) => {
    setClientStatus(newClientStatus);
    setWellbeing(newWellbeing);
  };

  const addDecision = (decision) => {
    setDecisionHistory((prev) => [...prev, decision]);
  };

  const resetGame = () => {
    setCurrentProgress(null);
    setClientStatus(50);
    setWellbeing(50);
    setCurrentScenario(null);
    setDecisionHistory([]);
  };

  const value = {
    currentProgress,
    clientStatus,
    wellbeing,
    currentScenario,
    showCarePlan,
    decisionHistory,
    startScenario,
    updateMeters,
    addDecision,
    resetGame,
    setShowCarePlan,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
