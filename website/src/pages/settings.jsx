import React, { useEffect } from 'react';
import { useSettings } from "../hooks/useSettings.js"; 
import useInterval from '../hooks/useInterval.js';

const SettingsPage = () => {
  // Destructure the settings state and your update function from context
  const  {settings, setSettings } = useSettings();

  const defaultSettings = settings

  useEffect(() => {
    setSettings(localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const saveSettings = () => {
    localStorage.setItem('userSettings', JSON.stringify(settings));
    setSettings(localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings);
  };

    useInterval(() => {
      saveSettings();
    }, 500)

  return (
    <div className="h-screen grow p-8 overflow-y-scroll scrollbar-width-0">
      <section className={`tracking-widest text-xl border-2 rounded-2xl ${settings.theme.pageHeader} p-2 min-h-0 mb-2`}>
        <h3 className="text-white text-center">Application Control Center</h3>
      </section>

      <section className={`text-gray-400 grid lg:grid-cols-3 grid-cols-1 w-full gap-2 border-2 rounded-2xl ${settings.theme.section} p-2 min-h-0`}>
        
        {/* General Settings */}
        <section className={`col-span-1 row-span-1 ${settings.theme.card} rounded-lg border-2 border-gray-200 p-2 flex flex-col gap-4`}>
          <h3 className="text-white text-center text-xl font-extrabold tracking-wider border-b border-gray-500 pb-2 mb-2">
            General Settings
          </h3>
          <h3>Themes</h3>
          <section className="flex justify-between items-center gap-2">
            <section className='flex'>
              <label className="text-white">Default</label>
              <input
                type='radio'
                name='default'
                checked={settings.theme.name === 'default'}
                onChange={() => setSettings((prev) => ({
                  ...prev,
                    theme: {
                      body: "bg-gray-950",
                      card: "bg-gray-700/80 border-gray-200",
                      pageHeader: "bg-gray-800/40 border-gray-200",
                      section: "bg-gray-800/40 border-gray-200 text-gray-400",
                      sidebar: "bg-gray-800/80 border-gray-900 border-b-4",
                      sidebarPage: "bg-gray-800/80 text-white hover:bg-gray-700",
                      name: 'default',
                    },
                  }
                ))}
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
            </section>
            <section className='flex'>
              <label className="text-white">Mauve</label>
              <input
                type='radio'
                name='mauve'
                checked={settings.theme.name === 'mauve'}
                onChange={() => setSettings((prev) => ({
                  ...prev,
                    theme: {
                      body: "bg-mauve-950",
                      card: "bg-mauve-700/80 border-mauve-200",
                      pageHeader: "bg-mauve-800/40 border-mauve-200",
                      section: "bg-mauve-800/40 border-mauve-200 text-mauve-400",
                      sidebar: "bg-mauve-800/80 border-mauve-900 border-b-4",
                      sidebarPage: "bg-mauve-800/80 text-white hover:bg-mauve-700",
                      name: 'mauve',
                    },
                  }
                ))}
                className="w-5 h-5 accent-blue-500 cursor-pointer"
              />
              </section>
              <section className='flex'>
                <label className="text-white">Zinc</label>
                <input
                  type='radio'
                  name='zinc'
                  checked={settings.theme.name === 'zinc'}
                  onChange={() => setSettings((prev) => ({
                    ...prev,
                      theme: {
                        body: "bg-zinc-950",
                        card: "bg-zinc-700/80 border-zinc-200",
                        pageHeader: "bg-zinc-800/40 border-zinc-200",
                        section: "bg-zinc-800/40 border-zinc-200 text-zinc-400",
                        sidebar: "bg-zinc-800/80 border-zinc-900 border-b-4",
                        sidebarPage: "bg-zinc-800/80 text-white hover:bg-zinc-700",
                        name: 'zinc',
                      },
                    }
                  ))}
                  className="w-5 h-5 accent-blue-500 cursor-pointer"
                />
              </section>
              <section className='flex'>
                <label className="text-white">Olive</label>
                <input
                  type='radio'
                  name='olive'
                  checked={settings.theme.name === 'olive'}
                  onChange={() => setSettings((prev) => ({
                    ...prev,
                      theme: {
                        body: "bg-olive-950",
                        card: "bg-olive-700/80 border-olive-200",
                        pageHeader: "bg-olive-800/40 border-olive-200",
                        section: "bg-olive-800/40 border-olive-200 text-olive-400",
                        sidebar: "bg-olive-800/80 border-olive-900 border-b-4",
                        sidebarPage: "bg-olive-800/80 text-white hover:bg-olive-700",
                        name: 'olive',
                      },
                    }
                  ))}
                  className="w-5 h-5 accent-blue-500 cursor-pointer"
                />
              </section>
          </section>
        </section>

        {/* Audio Settings */}
        <section className={`col-span-1 row-span-1 ${settings.theme.card} rounded-lg border-2 p-2 flex flex-col gap-4`}>
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
        <section className={`col-span-1 row-span-1 ${settings.theme.card} rounded-lg border-2 p-2 flex flex-col gap-4`}>
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
