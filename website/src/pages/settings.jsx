import React from 'react';
import { useSettings } from "../context/settings"; 

const SettingsPage = () => {
  // Destructure the settings state and your update function from context
  const  {settings, setSettings } = useSettings();

  // Helper function to handle nested state updates cleanly
  const handleToggle = (category, settingName) => {
    setSettings((prevSettings) => ({
      ...prevSettings,
      [category]: {
        ...prevSettings[category],
        [settingName]: !prevSettings[category][settingName],
      },
    }));
  };

  return (
    <div className="h-screen grow p-8 overflow-y-scroll scrollbar-width-0">
      <section className="tracking-widest text-xl border-2 rounded-2xl bg-gray-800 border-gray-200 p-2 min-h-0 mb-2">
        <h3 className="text-white text-center">Application Control Center</h3>
      </section>

      <section className="text-gray-400 grid grid-cols-3 w-full h-100 gap-2 border-2 rounded-2xl bg-gray-800 border-gray-200 p-2 min-h-0">
        
        {/* General Settings */}
        <section className="col-span-1 row-span-1 bg-gray-700 rounded-lg border-2 border-gray-200 p-2 flex flex-col gap-4">
          <h3 className="text-white text-center text-xl font-extrabold tracking-wider border-b border-gray-500 pb-2 mb-2">
            General Settings
          </h3>
          {/* Add general settings here in the future */}
        </section>

        {/* Audio Settings */}
        <section className="col-span-1 row-span-1 bg-gray-700 rounded-lg border-2 border-gray-200 p-2 flex flex-col gap-4">
          <h3 className="text-white text-center text-xl font-extrabold tracking-wider border-b border-gray-500 pb-2 mb-2">
            Audio Settings
          </h3>
          <div className="flex flex-col gap-3 px-2">
            <section className="flex justify-between items-center gap-2">
              <label className="text-white">Tornado Alert</label>
              <input 
                type="checkbox" 
                checked={settings.audio.tornadoAlert} 
                onChange={() => handleToggle('audio', 'tornadoAlert')}
                className="w-5 h-5 accent-blue-500 cursor-pointer" 
              />
            </section>
            <section className="flex justify-between items-center gap-2">
              <label className="text-white">Severe Thunderstorm Alert</label>
              <input 
                type="checkbox" 
                checked={settings.audio.severeThunderstormAlert} 
                onChange={() => handleToggle('audio', 'severeThunderstormAlert')}
                className="w-5 h-5 accent-blue-500 cursor-pointer" 
              />
            </section>
          </div>
        </section>

        {/* Speech Settings */}
        <section className="col-span-1 row-span-1 bg-gray-700 rounded-lg border-2 border-gray-200 p-2 flex flex-col gap-4">
          <h3 className="text-white text-center text-xl font-extrabold tracking-wider border-b border-gray-500 pb-2 mb-2">
            Speech Settings
          </h3>
          <div className="flex flex-col gap-3 px-2">
            <section className="flex justify-between items-center gap-2">
              <label className="text-white">Speak Tornado Alerts</label>
              <input 
                type="checkbox" 
                checked={settings.speech.tornadoAlert} 
                onChange={() => handleToggle('speech', 'tornadoAlert')}
                className="w-5 h-5 accent-blue-500 cursor-pointer" 
              />
            </section>
            <section className="flex justify-between items-center gap-2">
              <label className="text-white">Speak Severe Thunderstorm Alerts</label>
              <input 
                type="checkbox" 
                checked={settings.speech.severeThunderstormAlert} 
                onChange={() => handleToggle('speech', 'severeThunderstormAlert')}
                className="w-5 h-5 accent-blue-500 cursor-pointer" 
              />
            </section>
          </div>
        </section>

      </section>
    </div>
  );
};

export default SettingsPage;
