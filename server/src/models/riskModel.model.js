// --- Activation function ---
const relu = (x) => Math.max(0, x);
const reluDerivative = (x) => (x > 0 ? 1 : 0);

// --- Forward pass ---
function forward(input, model) {
    // 1. Calculate Hidden Layer 1
    const hidden1 = model.inputToHidden1.map((weights, i) => {
        const sum = weights.reduce((acc, w, j) => acc + w * input[j], 0) + model.hidden1Bias[i];
        return relu(sum);
    });

    // 2. Calculate Hidden Layer 2
    const hidden2 = model.hidden1ToHidden2.map((weights, i) => {
        const sum = weights.reduce((acc, w, j) => acc + w * hidden1[j], 0) + model.hidden2Bias[i];
        return relu(sum);
    });

    // 3. Calculate Output
    const output = model.hidden2ToOutput.reduce((acc, w, i) => acc + w * hidden2[i], 0) + model.outputBias;

    return { hidden1, hidden2, output };
}

// --- Training function ---
function trainNN(dataset, model, learningRate = 0.01, maxEpochs = 5000, threshold = 0.01) {
    let epoch = 0;
    let avgError = Infinity;

    while (avgError > threshold && epoch < maxEpochs) {
        let totalError = 0;

        // Shuffle dataset each epoch to improve learning
        dataset.sort(() => Math.random() - 0.5);

        for (const data of dataset) {
            // UPDATED: Now pulling all 7 features from the dataset
            const input = [
                data.encoded.severity, 
                data.encoded.certainty, 
                data.encoded.event, 
                data.encoded.watchWarning,
                data.encoded.gust,
                data.encoded.hail,
                data.encoded.threat,
                data.encoded.source
            ];
            
            const { hidden1, hidden2, output } = forward(input, model);

            const error = output - data.damageRisk;
            totalError += Math.abs(error);

            // --- Backpropagation ---
            const outputDelta = error; 

            // STEP A: Calculate Hidden Layer 2 Deltas
            const deltaH2 = [];
            for (let i = 0; i < model.hidden2ToOutput.length; i++) {
                // Notice we are using the current weights, not modified ones
                deltaH2.push(outputDelta * model.hidden2ToOutput[i] * reluDerivative(hidden2[i]));
            }

            // STEP B: Calculate Hidden Layer 1 Deltas
            const deltaH1 = [];
            for (let j = 0; j < model.inputToHidden1.length; j++) {
                let errorH1 = 0;
                for (let i = 0; i < deltaH2.length; i++) {
                    errorH1 += deltaH2[i] * model.hidden1ToHidden2[i][j];
                }
                deltaH1.push(errorH1 * reluDerivative(hidden1[j]));
            }

            // STEP C: Now safely apply all weight updates
            
            // 1. Output weights update
            for (let i = 0; i < model.hidden2ToOutput.length; i++) {
                model.hidden2ToOutput[i] -= learningRate * outputDelta * hidden2[i];
            }
            model.outputBias -= learningRate * outputDelta;

            // 2. Hidden Layer 2 weights update
            for (let i = 0; i < model.hidden1ToHidden2.length; i++) {
                for (let j = 0; j < hidden1.length; j++) {
                    model.hidden1ToHidden2[i][j] -= learningRate * deltaH2[i] * hidden1[j];
                }
                model.hidden2Bias[i] -= learningRate * deltaH2[i];
            }

            // 3. Hidden Layer 1 weights update
            for (let j = 0; j < model.inputToHidden1.length; j++) {
                for (let k = 0; k < input.length; k++) {
                    model.inputToHidden1[j][k] -= learningRate * deltaH1[j] * input[k];
                }
                model.hidden1Bias[j] -= learningRate * deltaH1[j];
            }
        }

        avgError = totalError / dataset.length;
        epoch++;
    }

    console.log("Training complete!");
    console.log("Final avg error:", avgError);
    console.log("Epochs:", epoch);
    return model;
}

module.exports = { forward, trainNN };