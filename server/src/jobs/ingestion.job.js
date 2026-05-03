const cron = require('node-cron');
const ingestAlerts = require('../services/ingestion.service')
const createScheduledBroadcast = require('../services/weatherman.service')

const startIngestion = () => {
    ingestAlerts()
    // createScheduledBroadcast();
    cron.schedule('*/30 * * * * *', () => {
        ingestAlerts()
    })
}

module.exports = startIngestion;

// area to filter is Alert.properties.areaDesc