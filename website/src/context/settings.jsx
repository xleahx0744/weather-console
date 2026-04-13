import { createContext, useState, useContext } from "react";

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    audio: {
        tornadoAlert: true,
        severeThunderstormAlert: true,
    },
    speech: {
        tornadoAlert: true,
        severeThunderstormAlert: false,
    }
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useSettings = () => useContext(SettingsContext);