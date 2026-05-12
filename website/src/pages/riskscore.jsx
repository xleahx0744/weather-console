import { useState, useEffect } from "react"
import useInterval from "../hooks/useInterval";
import { useSettings } from "../hooks/useSettings.js";
import { devServer } from "../utils/devserver.js";
import Footer from "../components/footer.jsx";

const riskToCategory = (risk) => {
    if (risk < 20) return 'Normal';
    if (risk < 40) return 'Minor';
    if (risk < 60) return 'Moderate';
    if (risk < 80) return 'Severe';
    return 'Extreme';
}

const riskBGLookup = (risk) => {
    if (risk < 20) return 'bg-green-600 text-white border-green-400';
    if (risk < 40) return 'bg-yellow-500 text-black border-yellow-400';
    if (risk < 60) return 'bg-orange-500 text-black border-orange-400';
    if (risk < 80) return 'bg-red-500 text-white border-red-400';
    return 'bg-purple-700 text-white border-purple-400';
}

export default function RiskScore() {
    const [data, setData] = useState();
    
    const fetchInfo = async () => {
        const response = await fetch(`${devServer}/info/in-depth-risk`);
        const data = await response.json();
        setData(data)
    }

    useEffect(() => {
        (async () => {
            await fetchInfo();
        })();
    }, [])

    useInterval(fetchInfo, 15000)

    const defaultSettings = useSettings().settings;

    const settings = localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings;


    return (
        <section className="h-screen grow p-8 overflow-y-scroll scrollbar-width-0">
            <section className={`tracking-widest text-xl border-2 rounded-2xl ${settings.theme.pageHeader} p-2 min-h-0 mb-2`}>
                <h3 className="text-white text-center">In-Depth Risk Score</h3>
            </section>
            <section className={`text-gray-400 md:grid md:grid-cols-3 md:grid-rows-1 flex flex-col w-full md:h-80 h-160 gap-4 border-2 rounded-2xl ${settings.theme.section} border-gray-200 p-2 min-h-0`}>
                <section className={`col-span-1 ${settings.theme.card} rounded-lg border-2 p-2 flex flex-col min-h-0 h-full`}>
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">Weather Risk Score</h3>
                    <p className={riskToCategory(data?.risk ?? 0).toLowerCase() + ' font-bold text-2xl text-center'}>{riskToCategory(data?.risk ?? 0)}</p>
                    <p className="text-white text-center text-xl font-extrabold tracking-wider">{(data?.risk ?? 0).toFixed(2)}</p>
                    <p className="text-center mt-2 text-xl text-white">Extra Risk Data</p>
                    { /*<p className="text-center mt-2 text-xl text-gray-400">Highest Damage Risk: {data?.maxRisk?.toFixed(2) * 100 || 0}% </p>
                    <p className="text-center mt-1 text-xl text-gray-400">Average Damage Risk: {data?.avgRisk?.toFixed(2) * 100 || 0}%</p> */}
                    <p className="text-center mt-1 text-xl text-gray-400">30-Minute Average: {data?.thirtyMinuteRisk ? (data.thirtyMinuteRisk.reduce((sum, item) => sum + item.data, 0) / data.thirtyMinuteRisk.length).toFixed(2) : 'N/A'}</p>
                </section>
                <section className={`col-span-2 ${settings.theme.card} rounded-lg border-2 p-2 flex flex-col min-h-0 h-full`}>
                    <h3 className="text-white text-center text-xl tracking-wider font-extrabold mb-2">30-Minute Risk History</h3>
                    <section className="flex-1 overflow-y-auto scrollbar-width-0 grid auto-rows-max lg:grid-cols-4 grid-cols-2 gap-2 min-h-0 max-h-full">
                        {data?.thirtyMinuteRisk
                            ?.slice()
                            ?.reverse()
                            ?.map((item, index) => (
                            <section key={index} className={`text-center text-xl border-2 p-2 rounded-md ${riskBGLookup(item.data)}`}>
                                <p>{new Date(item.timestamp).toLocaleTimeString()}</p>
                                <p className="font-bold">
                                    {item?.data?.toFixed(2)}
                                </p>
                            </section>
                        ))}
                    </section>
                </section>
            </section>
            <Footer />
        </section>
    )
}