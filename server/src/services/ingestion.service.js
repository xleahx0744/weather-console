const calculateRisk = require("./calculations.service");
const { setRisk, getRisk } = require('../utils/riskStore')
const { compareAndStore } = require('./comparison.service')


const ingestAlerts = async () => {

    const TRACKED_STATES = ['KY', 'OH', 'IN', 'WV'];
    const endpoint = TRACKED_STATES.join(',')

    try {
        const res = await fetch(`https://api.weather.gov/alerts/active?area=${endpoint}`); // ?area=${endpoint}
        if (!res.ok) {
            console.error('Failed to fetch alerts:', res.statusText);
            return;
        }
        const data = await res.json();

        if (data != []) {
            setRisk(calculateRisk(data))
            await compareAndStore();
        } else {
            console.log('No alerts')
        }
    } catch (error) {
        console.error(error)
    }
}

module.exports = ingestAlerts;