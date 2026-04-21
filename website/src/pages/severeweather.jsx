import { useSettings } from '../hooks/useSettings';

export default function SevereWeather() {
    const defaultSettings = useSettings().settings;
    
    // eslint-disable-next-line no-unused-vars
    const settings = localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings;
    return (
        <section className="h-screen grow p-8 overflow-y-scroll">
            <p>Risk Score</p>
        </section>
    )
}