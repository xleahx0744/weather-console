import { useState, useEffect } from "react";
import useInterval from "../hooks/useInterval";
import { useSettings } from "../hooks/useSettings.js";
import { devServer } from "../utils/devserver.js";

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
    const [showInfoId, setShowInfoId] = useState(null);

    const defaultSettings = useSettings().settings;

    const settings = localStorage.getItem('userSettings') ? JSON.parse(localStorage.getItem('userSettings')) : defaultSettings;

    const fetchInfo = async () => {
        const response = await fetch(`${devServer}/info/risk`);
        const data = await response.json();
        setData(data);
        setChanges(data.changes ?? []);

        setOldRisk(data.risk);
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchInfo();
        setOldRisk(data.risk);
     
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
        'severe thunderstorm warning',
        'tornado emergency',
        'severe thunderstorm watch',
    ]

    if (data?.current) {
        data.current.forEach(async e => {
            if (severeEvents.includes(e.event.toLowerCase()) && !uniqueAlerts.has(e.id)) {
                if (e.event.toLowerCase().includes("tornado")) {
                    uniqueAlerts.add(e.id);
                    if (settings.audio.tornadoAlert) {
                        new Audio("/tornadoAlert.wav").play();
                    }
                    if (settings.speech.tornadoAlert) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance(`A new ${e.event} has been issued for ${e.area}. The risk of damage is ${(e.adjustedRisk * 100).toFixed(2)} percent.`));
                    }
                } else if (e.event.toLowerCase().includes("severe thunderstorm")) {
                    uniqueAlerts.add(e.id);
                    if (settings.audio.severeThunderstormAlert) {
                        new Audio('/nonTornadoAlert.wav').play();
                    }
                    if (settings.speech.severeThunderstormAlert) {
                        window.speechSynthesis.speak(new SpeechSynthesisUtterance(`A new ${e.event} has been issued for ${e.area}. The risk of damage is ${(e.adjustedRisk * 100).toFixed(2)} percent.`));
                    }

                }
            }
            if (e.area.toLowerCase().includes('greenup') && !uniqueAlerts.has(e.id)) {
                uniqueAlerts.add(e.id);
                window.speechSynthesis.speak(new SpeechSynthesisUtterance(`A new ${e.event} has been issued that affects Greenup County. The risk of damage is ${(e.adjustedRisk * 100).toFixed(2)} percent.`));
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

        if (e.includes('high wind warning') || e.includes('wind advisory'))
            return "bg-[#999966] border-[#cccc66] text-black";

        if (e.includes('winter weather') || e.includes('ice storm') || e.includes('winter storm'))
            return "bg-[#66ccff] border-[#99ddff] text-black";

        if (e.includes('tropical storm') || e.includes('hurricane'))
            return "bg-[#ff6699] border-[#ff99bb] text-black";

        if (e.includes('gale warning') || e.includes('brisk wind') || e.includes('lake wind'))
            return "bg-[#999966] border-[#cccc66] text-black";

        if (e.includes('statement'))
            return "bg-[#3399ff] border-[#66ccff] text-white";

        if (e.includes("watch"))
            return "bg-[#ffcc00] border-[#ffff00] text-black";

        if (e.includes("advisory"))
            return "bg-[#3399ff] border-[#66ccff] text-white";

        return "bg-gray-700 border-gray-500 text-white";
    };

    useInterval(fetchInfo, 15000)

    return (
        <section className="h-screen grow p-8 overflow-y-scroll scrollbar-width-0">
            <section className={`tracking-widest text-xl border-2 ${settings.theme.pageHeader} rounded-2xl p-2 min-h-0 mb-2`}>
                <h3 className="text-white text-center">At-A-Glance Conditions</h3>
            </section>

            <section className={`lg:grid lg:grid-rows-3 lg:grid-cols-3 flex flex-col w-full h-fit lg:h-100 gap-2 border-2 rounded-2xl ${settings.theme.section} p-2 min-h-0`}>
                <section className={`col-span-1 ${settings.theme.card} rounded-lg border-2 p-2 flex flex-col`}>
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

                <section className={`col-span-1 row-start-2 row-span-2 ${settings.theme.card} rounded-lg border-2 p-2 flex flex-col`}>
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
                <section className={`col-span-2 lg:row-span-3 lg:h-full ${settings.theme.card} rounded-lg border-2 p-2 flex flex-col`}>
                    <h3 className={`text-white text-center text-xl font-extrabold`}>
                        Most Severe Weather Alerts
                    </h3>
                    <section className="flex-1 overflow-y-auto lg:grid auto-rows-max lg:grid-cols-3 flex-col flex gap-2 scrollbar-width-0">
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
                                    {alert['area'].toLowerCase().includes('greenup') && (
                                        <p className="text-xs font-extrabold blink-3">
                                            This alert affects Greenup County!
                                        </p>
                                    )}

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
            <section className={`tracking-widest text-xl mt-4 border-2 ${settings.theme.pageHeader} rounded-2xl p-2 min-h-0 mb-2`}>
                <h3 className="text-white text-center">Information Center</h3>
            </section>
            <section className={`lg:grid lg:auto-rows-max lg:grid-cols-6 w-full flex flex-col mt-2 h-content gap-2 border-2 rounded-2xl ${settings.theme.section} p-2 min-h-0`}>
                <section className={`${settings.theme.card} rounded-lg border-2 p-2 flex flex-col col-span-3`}>
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">
                        The Mission
                    </h3>
                    <p className={'font-bold text-xl text-center'}>
                        Flatwoods Weather is dedicated to providing real-time, local weather risk assessments to help you stay informed and prepared. Our mission is to empower individuals and communities with actionable insights, enabling them to make informed decisions and stay safe during severe weather events.
                    </p>
                </section>
                <section className={`${settings.theme.card} rounded-lg border-2 p-2 flex flex-col col-span-3`}>
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">
                        How Does It Work?
                    </h3>
                    <p className={'font-bold text-xl text-center'}>
                        Flatwoods Weather utilizes advanced machine learning algorithms and real-time data from the National Weather Service to provide accurate and up-to-date weather risk assessments. By analyzing various weather parameters and historical data, we generate a comprehensive risk score that helps you understand the potential impact of severe weather in the general Tri-State area.
                    </p>
                </section>
                <section className={`${settings.theme.card} rounded-lg border-2 p-2 flex flex-col col-span-2`}>
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">
                        At-A-Glance Conditions Explanation
                    </h3>
                    <p className={'font-bold text-xl text-center'}>
                        The At-A-Glance Conditions section provides a quick overview of the weather situation for the Tri-State area. It includes the weather risk score, which is a quantitative representation of how dangerous the current weather situation is. The risk score is categorized into different levels (Normal, Minor, Moderate, Severe, Extreme) to help you easily understand the severity of the weather. Additionally, it highlights the newest alerts and the most severe weather events currently impacting the area, allowing you to stay informed about potential threats and take necessary precautions.
                    </p>
                </section>
                <section className={`${settings.theme.card} rounded-lg border-2 p-2 flex flex-col col-span-4`}>
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">
                        Weather Risk Score
                    </h3>
                    <p className={'font-bold text-xl text-center'}>
                        The Weather Risk Score is a quantitative measure of how severe the current weather conditions are. It is split into 5 categories.
                    </p>
                    <hr className="mb-4 mt-4" />
                    <ul>
                        <li className="text-green-700 font-extrabold text-lg">0-29: Normal</li>
                        <p>Weather is low in severity, usually consisting of background events.</p>
                        <li className="text-yellow-500 font-extrabold text-lg">30-59: Minor</li>
                        <p>Weather is somewhat concerning, with potential for minor impacts.</p>
                        <li className="text-orange-500 font-extrabold text-lg">60-89: Moderate</li>
                        <p>Weather is significant, with moderate potential for damaging impacts.</p>
                        <li className="text-red-500 font-extrabold text-lg">90-119: Severe</li>
                        <p>Weather is very serious, with severe potential for significant impacts.</p>
                        <li className="text-purple-700 font-extrabold text-lg">120+: Extreme</li>
                        <p>Weather is extremely dangerous, with potential for catastrophic impacts.</p>
                    </ul>
                    <hr className="mb-4 mt-4" />
                    <p className="text-xl font-bold">We use Machine Learning to analyze the current weather and predict its severity. Remember that it is a rough estimate of the whole Tri-State area, so pay attention to events specific to your county.</p>
                </section>
                <section className={`${settings.theme.card} rounded-lg border-2 p-2 flex flex-col col-span-6`}>
                    <h3 className="text-white text-center text-xl font-extrabold tracking-wider">
                        Weather Events
                    </h3>
                    <section className="flex flex-col overflow-y-scroll scrollbar-width-0 gap-2 p-2">
                        <section className={`text-xl p-2 rounded-sm font-bold ${settings.theme.section} text-gray-400 hover:brightness-125 hover:cursor-pointer`} onClick={() => setShowInfoId('tornado-warning')}>
                            <p className={`text-xl p-2 rounded-sm font-bold text-red-400`} >Tornado Warning</p>
                            {showInfoId === 'tornado-warning' && (
                                <section>
                                    <p className="text-md p-2 text-gray-300">
                                        A tornado warning is issued when a tornado has been sighted or indicated by weather radar. It means that there is an imminent threat to life and property, and people in the affected area should take immediate action to seek shelter and protect themselves from the dangerous weather conditions.
                                    </p>
                                    <p className="p-2 text-gray-300">Tornado Warnings have a damage tag associated to them. They indicate the potential for significant damage to structures and life. These are the damage tags:</p>
                                    <ul className="text-gray-400 bg-gray-900/30 p-2 rounded-md">
                                        <li className="mb-2"><span className="font-bold text-yellow-300">BASE: </span>A normal tornado warning, if a tornado is on the ground it is not causing a lot of destruction. THIS DOES NOT MEAN IT IS SAFE! ALWAYS SHELTER IF A TORNADO WARNING IS ISSUED!</li>
                                        <li className="mb-2"><span className="font-bold text-orange-300">CONSIDERABLE: </span>A tornado is on the ground and poses a significant threat to life and property.</li>
                                        <li className="mb-2"><span className="font-bold text-red-300">CATASTROPHIC: </span>A violent tornado is on the ground and is expected to cause catastrophic damage and loss of life. These warnings are usually upgraded to a Tornado Emergency.</li>
                                    </ul>
                                    <p className="p-2 text-gray-300">Tornado Warnings also have a SOURCE tag that indicates how the tornado was detected.</p>
                                    <ul className="text-gray-400 bg-gray-900/30 p-2 rounded-md">
                                        <li className="mb-2"><span className="font-bold text-yellow-300">RADAR INDICATED: </span>A tornado was identified by weather professionals using doppler radar. This does not mean a tornado is on the ground, but should be treated just the same. ALWAYS TAKE SHELTER IN A TORNADO WARNING!</li>
                                        <li className="mb-2"><span className="font-bold text-red-300">CONFIRMED: </span>A tornado has been confirmed by weather spotters, emergency personnel, or other reliable sources. This means a tornado is actively on the ground.</li>
                                    </ul>
                                </section>
                            )}
                        </section>
                        <section className={`text-xl p-2 rounded-sm font-bold ${settings.theme.section} text-gray-400 hover:brightness-125 hover:cursor-pointer`} onClick={() => setShowInfoId('tornado-watch')}>
                            <p className={`text-xl p-2 rounded-sm font-bold text-yellow-400`} >Tornado Watch</p>
                            {showInfoId === 'tornado-watch' && (
                                <section>
                                    <p className="text-md p-2 text-gray-300">
                                        A tornado watch is issued when conditions are favorable for the development of tornadoes. It means that there is a potential threat to life and property, and people in the affected area should be prepared to take immediate action if a warning is issued.
                                    </p>
                                    <p className="p-2">A good way to think of a watch is as such. Inside of a restaurant, there are the various incredients to create a burger, but a burger has not been made. That is a Burger Watch. Once a burger is made, it becomes a Burger Warning.</p>
                                </section>
                            )}
                        </section>
                        <section className={`text-xl p-2 rounded-sm font-bold ${settings.theme.section} text-gray-400 hover:brightness-125 hover:cursor-pointer`} onClick={() => setShowInfoId('severe-thunderstorm')}>
                            <p className={`text-xl p-2 rounded-sm font-bold text-orange-400`} >Severe Thunderstorm Warning</p>
                            {showInfoId === 'severe-thunderstorm' && (
                                <section>
                                    <p className="text-md p-2 text-gray-300">
                                        A severe thunderstorm warning is issued when a severe thunderstorm is expected or occurring. It means that there is an imminent threat to life and property, and people in the affected area should take immediate action to seek shelter and protect themselves from the dangerous weather conditions.
                                    </p>
                                    <p className="p-2 text-gray-300">Severe Thunderstorm Warnings have a damage tag associated to them. They indicate the potential for significant damage to structures and life. These are the damage tags:</p>
                                    <ul className="text-gray-400 bg-gray-900/30 p-2 rounded-md">
                                        <li className="mb-2"><span className="font-bold text-yellow-300">BASE: </span>A normal severe thunderstorm warning, if the storm is producing damaging winds of 58MPH and higher or large hail of 1.00 inch and higher.</li>
                                        <li className="mb-2"><span className="font-bold text-orange-300">CONSIDERABLE: </span>A severe thunderstorm is producing large hail of 1.75 inches and higher or damaging winds of 70MPH and higher.</li>
                                        <li className="mb-2"><span className="font-bold text-red-300">DESTRUCTIVE: </span>A severe thunderstorm is producing extremely large hail of 2.50 inches and higher or devastating winds of 80MPH and higher.</li>
                                    </ul>
                                </section>
                            )}
                        </section>
                        <section className={`text-xl p-2 rounded-sm font-bold ${settings.theme.section} text-gray-400 hover:brightness-125 hover:cursor-pointer`} onClick={() => setShowInfoId('severe-thunderstorm-watch')}>
                            <p className={`text-xl p-2 rounded-sm font-bold text-yellow-400`} >Severe Thunderstorm Watch</p>
                            {showInfoId === 'severe-thunderstorm-watch' && (
                                <section>
                                    <p className="text-md p-2 text-gray-300">
                                        A severe thunderstorm watch is issued when conditions are favorable for the development of severe thunderstorms. It means that there is a potential threat to life and property, and people in the affected area should be prepared to take immediate action if a warning is issued.
                                    </p>
                                    <p className="p-2">A good way to think of a watch is as such. Inside of a restaurant, there are the various incredients to create a burger, but a burger has not been made. That is a Burger Watch. Once a burger is made, it becomes a Burger Warning.</p>
                                </section>
                            )}
                        </section>
                        <section className={`text-xl p-2 rounded-sm font-bold ${settings.theme.section} text-gray-400 hover:brightness-125 hover:cursor-pointer`} onClick={() => setShowInfoId('flash-flood-warning')}>
                            <p className={`text-xl p-2 rounded-sm font-bold text-blue-400`} >Flash Flood Warning</p>
                            {showInfoId === 'flash-flood-warning' && (
                                <p className="text-md p-2 text-gray-300">
                                    A flash flood warning is issued when a flash flood is expected or occurring. It means that there is an imminent threat to life and property, and people in the affected area should take immediate action to seek higher ground and protect themselves from the dangerous weather conditions.
                                </p>
                            )}
                        </section>
                        <section className={`text-xl p-2 rounded-sm font-bold ${settings.theme.section} text-gray-400 hover:brightness-125 hover:cursor-pointer`} onClick={() => setShowInfoId('flash-flood-watch')}>
                            <p className={`text-xl p-2 rounded-sm font-bold text-yellow-400`} >Flash Flood Watch</p>
                            {showInfoId === 'flash-flood-watch' && (
                                <p className="text-md p-2 text-gray-300">
                                    A flash flood watch is issued when conditions are favorable for the development of flash floods. It means that there is a potential threat to life and property, and people in the affected area should be prepared to take immediate action if a warning is issued.
                                </p>
                            )}
                        </section>
                    </section>
                </section>
            </section>
        </section>
    )
}