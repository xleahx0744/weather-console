const cron = require('node-cron');
const ingestAlerts = require('../services/ingestion.service')

const startIngestion = () => {
    
    cron.schedule('*/30 * * * * *', () => {
        ingestAlerts()
    })
}

module.exports = startIngestion;

// area to filter is Alert.properties.areaDesc