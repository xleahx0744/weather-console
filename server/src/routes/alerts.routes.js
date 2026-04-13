const express = require('express');
const { getRisk, getAlerts, getRiskAdvanced, getAlertChanges } = require('../utils/riskStore');

const router = express.Router();

router.get('/risk', (req, res) => {
    const data = {
        risk: getRisk(),
        current: getAlerts(),
        changes: getAlertChanges()
    }
    res.json(data);
})

router.get('/in-depth-risk', (req, res) => {
    const data = getRiskAdvanced();
    res.json(data);
});

module.exports = router;