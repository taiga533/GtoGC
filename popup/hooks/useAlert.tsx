import React, { createContext, useState, useContext } from 'react';

type AlertType = 'alert-success' | 'alert-error' | 'alert-info';

type Alert = {
  id: number;
  message: string;
  type: AlertType;
};

type AlertContextType = {
  alerts: Alert[];
  pushAlert: (message: string, type: AlertType) => void;
  removeAlert: (id: number) => void;
};

const AlertContext = createContext<AlertContextType>({
  alerts: [],
  pushAlert: () => {},
  removeAlert: () => {},
});

export const useAlertContext = () => useContext(AlertContext);

type AlertProviderProps = {
  children: React.ReactNode;
};

export const AlertProvider: React.FC<AlertProviderProps> = ({ children }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [nextId, setNextId] = useState(1);

  const pushAlert = (message: string, type: AlertType) => {
    const newAlert: Alert = { id: nextId, message, type };
    setAlerts((prevAlerts) => [...prevAlerts, newAlert]);
    setNextId((prevId) => prevId + 1);
  };

  const removeAlert = (id: number) => {
    setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, pushAlert, removeAlert }}>
      {children}
    </AlertContext.Provider>
  );
};