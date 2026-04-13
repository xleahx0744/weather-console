import { useState, useEffect } from "react";
import useInterval from "../hooks/useInterval";
import { useSettings } from "../context/settings";

const riskToCategory = (risk) => {
    if (risk < 30) return 'Normal';
    if (risk < 60) return 'Minor';
    if (risk < 90) return 'Moderate';
    if (risk < 120) return 'Severe';
    return 'Extreme';
}


let uniqueAlerts = new Set();

export default function HomePage() {
    const [data, setData] = useState([]);
    const [changes, setChanges] = useState([]);
    const [oldRisk, setOldRisk] = useState(0);

    const { settings } = useSettings();

    const fetchInfo = async () => {
        const response = await fetch('http://localhost:8000/info/risk');
        const data = await response.json();
        setData(data);
        setChanges(data.changes ?? []);
        

        if (riskToCategory(data.risk) === 'Extreme' && riskToCategory(oldRisk) !== 'Extreme') {
            new Audio("/tornadoAlert.wav").play();
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(`The weather risk score has reached extreme levels. The current risk is ${(data.risk).toFixed(2)} percent. Full monitoring mode is recommended. Please check the console for more details.`));
        }

        setOldRisk(data.risk);
    }

    useEffect(() => {
        fetchInfo();
        setOldRisk(data.risk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.risk])

    const sortData = (data) => {
        return [...(data?.current || [])].sort((a, b) => {
            return b.adjustedRisk - a.adjustedRisk;
        });
    };

    const increasingDecreasing = (newRisk) => {
        if (newRisk > oldRisk) {
            return 'text-shadow-md text-white text-shadow-green-400';
        } else if (newRisk < oldRisk) {
            return 'text-shadow-md text-white text-shadow-red-400';
        } else {
            return 'text-white';
        }
    }

    const severeEvents = [
        "tornado warning",
        'tornado watch',
        'severe thunderstorm warning',
        'tornado emergency'
    ]

    if (data?.current) {
        data.current.forEach(async e => {
            if (severeEvents.includes(e.event.toLowerCase()) && !uniqueAlerts.has(e.id)) {
                if (e.event.toLowerCase().includes("tornado")) {
                    if (settings.audio.tornadoAlert) {
                        new Audio("/tornadoAlert.wav").play();
                    }
                    if (settings.speech.tornadoAlert) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance(`A new ${e.event} has been issued for ${e.area}. The risk of damage is ${(e.adjustedRisk * 100).toFixed(2)} percent.`));
                    }
                } else if (e.event.toLowerCase().includes("severe thunderstorm")) {
                    if (settings.audio.severeThunderstormAlert) {
                        new Audio('/nonTornadoAlert.wav').play();
                    }
                    if (settings.speech.severeThunderstormAlert) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance(`A new ${e.event} has been issued for ${e.area}. The risk of damage is ${(e.adjustedRisk * 100).toFixed(2)} percent.`));
                    }

                }
                uniqueAlerts.add(e.id);
            }
        });
    }

    const getNWSStyle = (event) => {
        const e = event.toLowerCase();

        if (e.includes("tornado warning"))
            return "bg-[#cc0000] border-[#ff0000] text-white";
        if (e.includes("tornado watch"))
            return "bg-[#ffcc00] border-[#ffff00] text-black";
        if (e.includes('tornado emergency'))
            return "bg-[#d234eb] border-[#e246fa] text-black";
        if (e.includes("severe thunderstorm warning"))
            return "bg-[#ff9900] border-[#ffcc00] text-black";

        if (e.includes("flash flood warning"))
            return "bg-[#00cc66] border-[#00ff99] text-black";
        
        if (e.includes("flood warning"))
            return "bg-[#00cc66] border-[#00ff99] text-black";

        if (e.includes("freeze warning"))
            return "bg-[#3244a8] border-[#4454ab] text-white";

        if (e.includes("red flag warning") || e.includes("fire weather warning"))
            return "bg-[#ff6600] border-[#ff9900] text-black";

        if (e.includes('special weather statement'))
            return "bg-[#af25cf] border-[#b855cf] text-white";

        if (e.includes('high wind warning') || e.includes('wind advisory')) {
            return "bg-[#999966] border-[#cccc66] text-black";
        }
        if (e.includes('winter weather') || e.includes('ice storm') || e.includes('winter storm')) {
            return "bg-[#66ccff] border-[#99ddff] text-black";
        }
        if (e.includes('tropical storm') || e.includes('hurricane')) {
            return "bg-[#ff6699] border-[#ff99bb] text-black";
        }

        if (e.includes('gale warning') || e.includes('brisk wind') || e.includes('lake wind')) {
            return "bg-[#999966] border-[#cccc66] text-black";
        }

        if (e.includes('statement')) {
            return "bg-[#3399ff] border-[#66ccff] text-white";
        }

        if (e.includes("watch"))
            return "bg-[#ffcc00] border-[#ffff00] text-black";

        if (e.includes("advisory"))
            return "bg-[#3399ff] border-[#66ccff] text-white";

        return "bg-gray-700 border-gray-500 text-white";
    };

    useInterval(fetchInfo, 15000)

    return (
        <section className="h-screen grow p-8 overflow-y-scroll scrollbar-width-0">
            <section className="tracking-widest text-xl border-2 rounded-2xl bg-gray-800 border-gray-200 p-2 min-h-0 mb-2">
                <h3 className="text-white text-center">At-A-Glance Conditions</h3>
            </section>

            <section className="text-gray-400 grid grid-cols-3 grid-rows-3 w-full h-100 gap-2 border-2 rounded-2xl bg-gray-800 border-gray-200 p-2 min-h-0">
                <section className="col-span-1 bg-gray-700 rounded-lg border-2 border-gray-200 p-2 flex flex-col">
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">
                        Weather Risk Score
                    </h3>
                    <p className={riskToCategory(data?.risk ?? 0).toLowerCase() + ' font-bold text-2xl text-center'}>
                        {riskToCategory(data?.risk ?? 0)}
                    </p>
                    <p className={"text-2xl text-center " + increasingDecreasing(data?.risk ?? 0)}>
                        {(data?.risk ?? 0).toFixed(2)}
                    </p>
                </section>

                <section className="col-span-1 row-start-2 row-span-2 bg-gray-700 rounded-lg border-2 border-gray-200 p-2 flex flex-col">
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">
                        Newest Alerts
                    </h3>

                    <section className="flex-1 overflow-y-auto flex flex-col gap-2 scrollbar-width-0">

                        {changes.length === 0 ? (
                            <p className="text-center text-gray-400 text-sm">
                                No Changes Detected
                            </p>
                        ) : (
                            changes.map((alert) => (
                                <div
                                    key={alert.id}
                                    className={`rounded-lg p-2 border-2 transition-all duration-300 ${getNWSStyle(alert.event)}`}
                                >
                                    <p className="text-sm font-semibold">{alert.event}</p>
                                    <p className="text-xs">Area: {alert.area}</p>
                                    <p className="text-xs">
                                        Damage Risk: {(alert.adjustedRisk * 100).toFixed(2)}%
                                    </p>
                                    <p className="text-xs italic">
                                        {(() => {
                                            if (alert._type === "new") {
                                                return "NEW";
                                            } else if (alert._type === "removed") {
                                                return "REMOVED";
                                            } else if (alert._type === "updated") {
                                                 return "UPDATED";
                                            }
                                            return "ERRORED";
                                        })()}
                                    </p>
                                </div>
                            ))
                        )}

                    </section>
                </section>

                {/*Most Severe */}
                <section className="col-span-2 row-span-3 bg-gray-700 rounded-lg border-2 border-gray-200 p-2 flex flex-col">
                    <h3 className="text-white text-center text-xl font-extrabold">
                        Most Severe Weather Alerts
                    </h3>
                    <section className="flex-1 overflow-y-auto grid auto-rows-max grid-cols-3 gap-2 scrollbar-width-0">
                        {data.current && sortData(data).map((alert) => {
                            // Destructure the parameters cleanly with a fallback
                            const {
                                maxHailThreat,
                                maxHailSize,
                                maxWindGust,
                                tornadoDamageThreat,
                                flashFloodDamageThreat,
                                tornadoDetection,
                                flashFloodDetection,
                                thunderstormDamageThreat
                            } = alert.parameters || {};

                            // Check if ANY of these specific threats have truthy values
                            const hasThreats = Boolean(
                                maxHailThreat || maxWindGust || tornadoDamageThreat || 
                                flashFloodDamageThreat || tornadoDetection || 
                                flashFloodDetection || thunderstormDamageThreat
                            );

                            return (
                                <div
                                    key={alert.id}
                                    className={`rounded-lg p-2 border-2 ${getNWSStyle(alert.event)} flex flex-col`}
                                >
                                    <p className="text-sm font-semibold">{alert.event}</p>
                                    <p className="text-xs">Area: {alert.area}</p>
                                    <p className="text-xs">
                                        Damage Risk: {(alert.adjustedRisk * 100).toFixed(2)}%
                                    </p>

                                    {/* Only render this entire block if actual threats exist */}
                                    {hasThreats && (
                                        <div className="mt-auto">
                                            <hr className="my-2 border-gray-400" /> 
                                            <p className="text-xs font-bold mb-1">Threats and Impacts:</p>
                                            <div className="text-xs space-y-0.5">
                                                {maxHailThreat && <p>Hail Threat: {maxHailThreat}</p>}
                                                {maxHailSize && <p>Max Hail Size: {maxHailSize}in</p>}
                                                {maxWindGust && <p>Max Wind Gust: {maxWindGust}</p>}
                                                {tornadoDamageThreat && <p>Tornado Damage Threat: {tornadoDamageThreat}</p>}
                                                {flashFloodDamageThreat && <p>Flash Flood Damage Threat: {flashFloodDamageThreat}</p>}
                                                {tornadoDetection && <p>Tornado: {tornadoDetection}</p>}
                                                {flashFloodDetection && <p>Flash Flood: {flashFloodDetection}</p>}
                                                {thunderstormDamageThreat && <p>Thunderstorm Threat: {thunderstormDamageThreat}</p>}
                                            </div>
                                        </div>
                                    )}
                                    
                                    <a
                                        className="text-xs underline mt-3"
                                        href={alert.id}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        View Raw Details
                                    </a>
                                </div>
                            );
                        })}
                    </section>
                </section>

            </section>
        </section>
    )
}