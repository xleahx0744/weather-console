const { forward } = require('../models/riskModel.model')
const trainedModel = require('../jobs/trainedModel.json')
const { setAlerts, setRiskAdvanced } = require('../utils/riskStore')
const turf = require('@turf/turf')
const createScheduledBroadcast = require('./weatherman.service')

const SEVERITY = {
    unknown: 0.2, minor: 0.4, moderate: 0.6, severe: 0.8, extreme: 1.0
}

const CERTAINTY = {
    observed: 1.0, imminent: 0.95, likely: 0.8, possible: 0.5, unlikely: 0.2,
}

const EVENT = {
    "severe thunderstorm warning": 0.6, "severe thunderstorm watch": 0.6, "special weather statement": 0.2,
    'tornado emergency': 2.0, "tornado warning": 1.0, "tornado watch": 0.6,
    "flash flood warning": 0.7, "wind advisory": 0.3, 'small craft advisory': 0.1,
    'gale watch': 0.1, 'gale warning': 0.1, 'brisk wind advisory': 0.1,
    'high wind watch': 0.3, 'fire weather watch': 0.1, 'flood watch': 0.3,
    'heat advisory': 0.1, 'winter weather advisory': 0.2, 'rip current statement': 0.1,
    'heavy freezing spray warning': 0.6, 'flood warning': 0.1, 'red flag warning': 0.01,
    'special marine warning': 0.1, 'flood advisory': 0.1, 'freeze warning': 0.3,
    'fire weather warning': 0.1, 'marine weather statement': 0.1, 'lake wind advisory': 0.1,
    'dense fog advisory': 0.1, 'dense smoke advisory': 0.1, 'ice storm warning': 0.2,
    'winter storm watch': 0.1, 'winter storm warning': 0.1, 'tropical storm warning': 0.1,
}

const containsWatch = (alert) => {
    const alertEvent = alert.properties.event.toLowerCase();
    if (alertEvent.includes('flood')) return 0;
    if (alertEvent.includes('warning')) return 0.6;
    if (alertEvent.includes('watch')) return 0.3;
    if (alertEvent.includes('advisory')) return 0.2;
    return 0.1;
}

const extractParameters = (params) => {
    if (!params) return { gust: 0, hail: 0, threat: 0, source: 0 };
    
    let gust = 0, hail = 0, threat = 0, source = 0;

    if (params.maxWindGust) {
        gust = Math.min(1, parseInt(params.maxWindGust[0]) / 100);
    }
    if (params.maxHailSize) {
        hail = Math.min(1, parseFloat(params.maxHailSize[0]) / 4.0);
    }

    const threatLevel = params.tornadoDamageThreat?.[0] || params.thunderstormDamageThreat?.[0] || params.flashFloodDamageThreat?.[0];
    if (threatLevel) {
        const tl = threatLevel.toUpperCase();
        if (tl === 'CONSIDERABLE') threat = 0.6;
        if (tl === 'DESTRUCTIVE' || tl === 'CATASTROPHIC') threat = 1.0;
    }

    const detection = params.tornadoDetection?.[0] || params.waterspoutDetection?.[0] || params.flashFloodDetection?.[0];
    if (detection) {
        const det = detection.toUpperCase();
        if (det === 'POSSIBLE') source = 0.2;
        if (det === 'RADAR INDICATED' || det === 'RADAR AND GAUGE INDICATED') source = 0.6;
        if (det === 'OBSERVED') source = 1.0;
    }

    return { gust, hail, threat, source };
};

const calculateRisk = (data) => {
    const areaAlerts = data.features;
    if (!areaAlerts || areaAlerts.length === 0) return 0;

    // --- Step 1: Predict & Calculate Raw Scores ---
    const predictions = areaAlerts.map(alert => {
        const eventParameters = alert.properties.parameters || {};

        const severity = SEVERITY[alert.properties.severity?.toLowerCase()] || 0.5;
        const certainty = CERTAINTY[alert.properties.certainty?.toLowerCase()] || 0.5;
        const eventWeight = EVENT[alert.properties.event?.toLowerCase()] || 0.5;
        const watchWarning = containsWatch(alert);

        const { gust, hail, threat, source } = extractParameters(eventParameters);

        const { output } = forward([
            severity, certainty, eventWeight, watchWarning, gust, hail, threat, source
        ], trainedModel);

        let adjRisk = output < 0.2 ? 0 : output;
        adjRisk = isNaN(adjRisk) ? 0 : Math.max(0, adjRisk);

        let rawScore = adjRisk * eventWeight * 80;

        // The Watch & Advisory Cap (prevents minor alerts from generating high base scores)
        const eventName = alert.properties.event?.toLowerCase() || "";
        if (eventName.includes('advisory') || eventName.includes('statement')) {
            rawScore = Math.min(rawScore, 20);
        } else if (eventName.includes('watch')) {
            rawScore = Math.min(rawScore, 35);
        }

        return {
            id: alert.id,
            event: alert.properties.event,
            area: alert.properties.areaDesc,
            predictedRisk: output,
            adjustedRisk: adjRisk,
            eventWeight: eventWeight,
            rawScore: rawScore,
            parameters: alert.properties.parameters || {}
        };
    });

    // --- Step 2: Calculate Stacked Energy (Severe ONLY) ---
    const sortedPredictions = [...predictions]
        .sort((a, b) => b.rawScore - a.rawScore)
        .filter(alert => alert.rawScore >= 10); // Keep noise out of your UI logs
    
    let rawNationalEnergy = 0;
    let severeCount = 0;
    let severeStackIndex = 0;
    const decayContributions = [];

    if (sortedPredictions.length > 0) {
        // 1. The Alpha Alert ALWAYS sets the baseline, severe or not.
        const alphaAlert = sortedPredictions[0];
        rawNationalEnergy = alphaAlert.rawScore;
        
        if (alphaAlert.eventWeight >= 0.6) {
            severeCount++;
            severeStackIndex++;
        }

        decayContributions.push({
            event: alphaAlert.event,
            rawScore: alphaAlert.rawScore,
            decayApplied: 1.0,
            actualContribution: alphaAlert.rawScore
        });

        // 2. Evaluate the REST of the alerts
        for (let i = 1; i < sortedPredictions.length; i++) {
            const alert = sortedPredictions[i];
            
            // ONLY Severe Warnings (0.6+) are allowed to stack and build national energy!
            if (alert.eventWeight >= 0.6) {
                severeCount++;
                severeStackIndex++;
                
                // Harmonic decay based ONLY on the number of severe storms
                const decayFactor = 1 / severeStackIndex; 
                const contributedPoints = alert.rawScore * decayFactor;
                
                rawNationalEnergy += contributedPoints;


                decayContributions.push({
                    event: alert.event,
                    rawScore: alert.rawScore,
                    decayApplied: decayFactor,
                    actualContribution: contributedPoints
                });
            } else {
                // Non-severe alerts are logged for your UI, but contribute 0 to the stack
                decayContributions.push({
                    event: alert.event,
                    rawScore: alert.rawScore,
                    decayApplied: 0,
                    actualContribution: 0
                });
            }
        }
    }

    // --- Step 3: The National Density Modifier ---
    // Heavily dampens isolated storms, unlocks full multiplier for widespread outbreaks
    const densityModifier = Math.min(1.0, 0.5 + (severeCount / 40));

    // Calculate final score and apply a hard cap of 100
    let finalRiskScore = parseFloat((rawNationalEnergy * densityModifier).toFixed(2));
    finalRiskScore = finalRiskScore; 

    // --- Step 4: Save depth info for reporting ---
    const inDepthRisk = {
        baseAlertCount: areaAlerts.length,
        severeWarningCount: severeCount,
        rawNationalEnergy: Math.round(rawNationalEnergy),
        densityModifierApplied: densityModifier,
        risk: finalRiskScore,
        breakdown: decayContributions,
        alerts: sortedPredictions
    };

    setAlerts(sortedPredictions);
    setRiskAdvanced(inDepthRisk);

    return finalRiskScore;
};

module.exports = calculateRisk;