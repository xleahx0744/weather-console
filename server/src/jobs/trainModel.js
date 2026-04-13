const { trainNN } = require("../models/riskModel.model");
const fs = require("fs");

const events =[
    { name: 'severe thunderstorm warning', value: 0.6 },
    { name: 'severe thunderstorm watch', value: 0.6 },
    { name: 'special weather statement', value: 0.2 },
    { name: 'tornado emergency', value: 2 },
    { name: 'tornado warning', value: 1 },
    { name: 'tornado watch', value: 0.6 },
    { name: 'flash flood warning', value: 0.7 },
    { name: 'wind advisory', value: 0.3 },
    { name: 'small craft advisory', value: 0.1 },
    { name: 'gale watch', value: 0.1 },
    { name: 'gale warning', value: 0.1 },
    { name: 'brisk wind advisory', value: 0.1 },
    { name: 'high wind watch', value: 0.3 },
    { name: 'fire weather watch', value: 0.1 },
    { name: 'flood watch', value: 0.3 },
    { name: 'heat advisory', value: 0.1 },
    { name: 'winter weather advisory', value: 0.2 },
    { name: 'rip current statement', value: 0.1 },
    { name: 'heavy freezing spray warning', value: 0.6 },
    { name: 'flood warning', value: 0.1 },
    { name: 'red flag warning', value: 0.01 },
    { name: 'special marine warning', value: 0.1 },
    { name: 'flood advisory', value: 0.1 },
    { name: 'freeze warning', value: 0.3 },
    { name: 'fire weather warning', value: 0.1 },
    { name: 'marine weather statement', value: 0.1 },
    { name: 'lake wind advisory', value: 0.1 },
    { name: 'dense fog advisory', value: 0.1 },
    { name: 'dense smoke advisory', value: 0.1 },
    { name: 'ice storm warning', value: 0.2 },
    { name: 'winter storm watch', value: 0.2 }
];

const containsWatch = (alert) => {
    if (alert.name.toLowerCase().includes('warning')) return 0.6;
    if (alert.name.toLowerCase().includes('watch')) return 0.3;
    if (alert.name.toLowerCase().includes('advisory')) return 0.2;
    return 0.1;
};

const severities = [0.2, 0.4, 0.6, 0.8, 1.0];
const certainties = [0.2, 0.5, 0.8, 0.95, 1.0];
const maxHailSize = [0, 0.2, 0.3, 0.6, 0.9, 1.0];
const maxWindGusts = [0, 0.2, 0.4, 0.7, 1.0];
const damageThreat = [0, 0.6, 1.0]; 

// NEW: Source tags mapped to risk values (Possible -> Radar Indicated -> Observed)
const sourceTypes = [0, 0.2, 0.6, 1.0];

// UPDATED: Now returns gust, hail, threat, and source
const relevantParameters = (event) => {
    let gust = 0, hail = 0, threat = 0, source = 0;
    const eventName = event.name.toLowerCase();

    if (eventName.includes('tornado') || eventName.includes('thunderstorm') || eventName.includes('flash flood')) {
        threat = damageThreat[Math.floor(Math.random() * damageThreat.length)];
        gust = maxWindGusts[Math.floor(Math.random() * maxWindGusts.length)];
        source = sourceTypes[Math.floor(Math.random() * sourceTypes.length)]; // Assign random source
        
        // Flash floods don't have hail, so skip it
        if (!eventName.includes('flash flood')) {
            hail = maxHailSize[Math.floor(Math.random() * maxHailSize.length)];
        }
    }
    
    return { gust, hail, threat, source };
};

const generateDataset = (numSamples = 5000) => {
    const dataset = [];

    for (let i = 0; i < numSamples; i++) {
        const severity = severities[Math.floor(Math.random() * severities.length)];
        const certainty = certainties[Math.floor(Math.random() * certainties.length)];
        const pickedEvent = events[Math.floor(Math.random() * events.length)];
        const event = pickedEvent.value;
        const watchWarning = containsWatch(pickedEvent);
        
        // Grab the 4 flat parameters
        const { gust, hail, threat, source } = relevantParameters(pickedEvent);

        // UPDATED: Added source to the formula and rebalanced weights to equal ~1.0
        let damageRisk =
            0.15 * severity +
            0.15 * certainty +
            0.10 * event +
            0.10 * watchWarning +
            0.15 * threat +
            0.10 * gust +
            0.10 * hail +
            0.15 * source +
            (Math.random() - 0.5) * 0.1; // small random noise

        damageRisk = Math.max(0, Math.min(1, damageRisk));

        dataset.push({
            // Store all 8 variables flat in the encoded object
            encoded: { severity, certainty, event, watchWarning, gust, hail, threat, source },
            damageRisk
        });
    }

    return dataset;
};

const dataset = generateDataset();

const randomWeight = () => (Math.random() * 2) - 1;

// UPDATED: Layer 1 now requires 8 weights per neuron to match the 8 inputs
const model = {
    // Hidden Layer 1: 3 neurons, 8 INPUTS EACH 
    inputToHidden1: [
        [randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight()], 
        [randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight()], 
        [randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight(), randomWeight()]  
    ],
    hidden1Bias: [randomWeight(), randomWeight(), randomWeight()],

    // Hidden Layer 2: 4 neurons, 3 inputs each (from H1)
    hidden1ToHidden2: [
        [randomWeight(), randomWeight(), randomWeight()], 
        [randomWeight(), randomWeight(), randomWeight()], 
        [randomWeight(), randomWeight(), randomWeight()], 
        [randomWeight(), randomWeight(), randomWeight()]  
    ],
    hidden2Bias: [randomWeight(), randomWeight(), randomWeight(), randomWeight()],

    // Output Layer: 1 neuron, 4 inputs (from H2)
    hidden2ToOutput: [randomWeight(), randomWeight(), randomWeight(), randomWeight()],
    outputBias: randomWeight()
};

// Train
const trainedModel = trainNN(dataset, model, 0.025, 50000);

// Save model to JSON
fs.writeFileSync("trainedModel.json", JSON.stringify(trainedModel));
console.log("Model trained and saved!");