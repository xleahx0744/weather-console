const db = require('../config/db');
const { getRisk, getAlerts } = require('../utils/riskStore');
const crypto = require('crypto');

let oldRisk = 0;
const THRESHOLD = 0.01;

const compareAndStore = async () => {
    const newRisk = Number(getRisk().toFixed(2));

    if (Math.abs(oldRisk - newRisk) > THRESHOLD) {
        try {

            await db.query(
                'INSERT INTO weather_history (id, risk, events, damage, date) VALUES ($1, $2, $3, $4, $5)',
                [
                    crypto.randomUUID(),
                    newRisk,
                    JSON.stringify(getAlerts()),
                    0,
                    new Date().toLocaleString(),
                ]
            );

            oldRisk = newRisk;
        } catch (error) {
            console.error(error);
        }
    }
};

module.exports = { compareAndStore };