import { useState } from "react";
import { SettingsContext } from "../hooks/useSettings";

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    audio: {
        tornadoAlert: true,
        severeThunderstormAlert: true,
    },
    speech: {
        tornadoAlert: true,
        severeThunderstormAlert: false,
    },
    theme: {
      body: "bg-gray-950",
      card: "bg-gray-700 border-gray-200",
      pageHeader: "bg-gray-800 border-gray-200",
      section: "bg-gray-800 border-gray-200 text-gray-400",
      sidebar: "bg-gray-800 border-gray-900",
      sidebarPage: "bg-gray-800 text-white hover:bg-gray-700",
      name: 'default',
    },
  });

  return (
    <SettingsContext.Provider value={{ settings, setSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};