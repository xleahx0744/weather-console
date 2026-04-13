/**
 * Historical NWS API & Damage Report Combiner
 * Run with: node index.js
 */

// --- 1. SCORING FORMULAS (Unchanged) ---

function calculateAlertRiskScore(parameters) {
    if (!parameters) return 0;
    let score = 0;

    // Tornado Threat (Max Weight: 50)
    const torThreat = parameters.tornadoDamageThreat ? parameters.tornadoDamageThreat[0].toUpperCase() : null;
    const torDetection = parameters.tornadoDetection ? parameters.tornadoDetection[0].toUpperCase() : null;
    
    if (torThreat === 'CATASTROPHIC') score += 50;
    else if (torThreat === 'CONSIDERABLE') score += 37.5; // 0.75 * 50
    else if (torDetection === 'OBSERVED') score += 35;    // 0.7 * 50
    else if (torDetection === 'RADAR INDICATED') score += 20; // 0.4 * 50

    // Wind Threat (Max Weight: 15)
    const windGust = parameters.maxWindGust ? parseFloat(parameters.maxWindGust[0]) : 0;
    let windScore = Math.max(0, Math.min((windGust - 50) / 100, 1.0));
    score += windScore * 15;

    // Hail Threat (Max Weight: 5)
    const hailSize = parameters.maxHailSize ? parseFloat(parameters.maxHailSize[0]) : 0;
    let hailScore = Math.min(hailSize / 4.0, 1.0);
    score += hailScore * 5;

    // Flash Flood Threat (Max Weight: 30)
    const floodThreat = parameters.flashFloodDamageThreat ? parameters.flashFloodDamageThreat[0].toUpperCase() : null;
    if (floodThreat === 'CATASTROPHIC') score += 30;
    else if (floodThreat === 'CONSIDERABLE') score += 21; // 0.7 * 30

    return parseFloat(score.toFixed(2));
}

function calculateActualDamageScore(damageReport) {
    if (!damageReport) return 0.0;
    const totalDamage = damageReport.propertyDamage + damageReport.cropDamage;
    let damageScore = 0.0;
    
    if (totalDamage > 0) {
        const logDamage = Math.log10(totalDamage);
        damageScore = Math.min(Math.max(logDamage / 9.0, 0), 1.0);
    }
    if (damageReport.fatalities > 0) damageScore = 1.0;

    return parseFloat(damageScore.toFixed(3));
}

// --- 2. HISTORICAL DATA FETCHING ---

// Fetch historical alerts from the NWS API using a time window
async function fetchHistoricalNWSAlerts(startDate, endDate) {
    // Construct the URL with start, end, and event type parameters
    const url = new URL('https://api.weather.gov/alerts');
    url.searchParams.append('start', startDate);
    url.searchParams.append('end', endDate);
    url.searchParams.append('event', 'Tornado Warning,Severe Thunderstorm Warning');

    console.log(`Querying NWS API for events between ${startDate} and ${endDate}...`);
    
    try {
        const response = await fetch(url.toString(), {
            headers: { 'User-Agent': 'NeuralNetTrainer/1.0 contact@myemail.com' }
        });
        
        if (!response.ok) {
            throw new Error(`API returned status: ${response.status}`);
        }
        
        const data = await response.json();
        return data.features || [];
    } catch (error) {
        console.error("Error fetching historical NWS alerts:", error);
        return [];
    }
}

// SIMULATED: Fetch historical damage from your local NOAA NCEI database
async function fetchHistoricalDamageReport(alertId) {
    // In a real app, you would query your local DB using the alert's polygon and time.
    // For now, we simulate finding a matching damage report.
    return {
        eventMatched: true,
        propertyDamage: 500000, // $500,000
        cropDamage: 10000,      // $10,000
        fatalities: 0,
        injuries: 0
    };
}

// --- 3. PIPELINE EXECUTION ---

async function runDataPipeline() {
    // Define a recent historical window (e.g., a known severe weather day in the last month)
    // Note: If you put a date from 5 years ago, the NWS API will return empty.
    const startWindow = '2026-01-01T00:00:00Z'; 
    const endWindow = '2026-03-15T00:00:00Z';   

    const historicalAlerts = await fetchHistoricalNWSAlerts(startWindow, endWindow);
    
    if (historicalAlerts.length === 0) {
        console.log("No alerts found for this timeframe. (Remember: NWS API only stores recent history).");
        return;
    }

    console.log(`Found ${historicalAlerts.length} historical warnings. Processing the first one...`);

    const sampleAlert = historicalAlerts[0];
    const properties = sampleAlert.properties;
    
    // Fetch the ground-truth damage
    const damageReport = await fetchHistoricalDamageReport(properties.id);

    // Calculate Scores
    const predictedRiskScore = calculateAlertRiskScore(properties.parameters);
    const groundTruthDamageScore = calculateActualDamageScore(damageReport);

    // Combine into final Neural Network training object
    const trainingObject = {
        alertId: properties.id,
        wfo: properties.senderName,
        timeframe: {
            sent: properties.sent,
            effective: properties.effective,
            expires: properties.expires
        },
        rawFeatures: {
            event: properties.event,
            severity: properties.severity,
            parameters: properties.parameters
        },
        rawDamage: damageReport,
        networkInputs: {
            calculatedRiskIndex: predictedRiskScore,
        },
        networkTarget: {
            groundTruthSeverity: groundTruthDamageScore
        }
    };

    console.log("\n--- GENERATED TRAINING DATA POINT ---");
    console.log(JSON.stringify(trainingObject, null, 2));
}

runDataPipeline();