import './App.css'
import Sidebar from './sidebar'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/homepage'
import RiskScore from './pages/riskscore'
import SevereWeather from './pages/severeweather'
import { SettingsProvider } from './context/settings';
import SettingsPage from './pages/settings'
import { useSettings } from './hooks/useSettings'

function AppComponent() {
  const defaultSettings = useSettings().settings;

  // eslint-disable-next-line no-unused-vars
  const settings = localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings;

  return (
    <section className={`bg-weather-storm h-screen overflow-clip flex flex-col`}>
      <Sidebar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/risk' element={<RiskScore/>} />
        <Route path='/severe-weather' element={<SevereWeather />} />
        <Route path='/settings' element={<SettingsPage />} />
      </Routes>
    </section>
  )
}

function App() {
  return (
    <SettingsProvider>
      <Router>
        <AppComponent />
      </Router>
    </SettingsProvider>
  )
}

export default App
