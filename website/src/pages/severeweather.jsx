import { useSettings } from '../hooks/useSettings';
import { DaySunny, Rain, Thunderstorm } from '../assets/weather-svg.jsx';
import Footer from '../components/footer.jsx';

export default function SevereWeather() {
    const defaultSettings = useSettings().settings;
    
    const settings = localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings;
    return (
        <section className='h-screen grow p-8 overflow-y-scroll scrollbar-width-0'>
            <section className={`tracking-widest text-xl border-2 ${settings.theme.pageHeader} rounded-2xl p-2 min-h-0 mb-2`}>
                <h3 className="text-white text-center">3-Day Forecast</h3>
            </section>
            <section className={`lg:grid lg:grid-cols-6 flex flex-col w-full h-fit lg:h-100 gap-2 border-2 rounded-2xl ${settings.theme.section} p-2 min-h-0`}>
                <section className={`${settings.theme.card} rounded-lg border-2 p-2 flex flex-col`}>
                    <h3 className={`text-white text-center text-xl font-extrabold tracking-wider mb-2`}>Today</h3>
                    <Thunderstorm className='text-7xl text-white bg-gray-600/40 rounded-lg border-4 border-gray-500 mx-auto mb-2' />
                    <p className="text-center text-white text-lg">High: 85°F</p>
                    <p className="text-center text-white text-lg">Low: 70°F</p>
                    <p className="text-center mt-2 text-xl text-white">Severe Thunderstorms expected in the afternoon. Stay alert!</p>
                </section>
            </section>
            <Footer />
        </section>
    )
}