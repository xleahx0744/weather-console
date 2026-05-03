const { Ollama } = require('ollama');
const ollama = new Ollama();
const cron = require('node-cron');
const { getRiskAdvanced, getAlerts, getAlertChanges } = require('../utils/riskStore')


const createScheduledBroadcast = () => {
    startWeatherBroadcast();
    cron.schedule('*/10 * * * *', () => {
        console.log("Starting scheduled weather broadcast...");
        startWeatherBroadcast();
    });
};

async function startWeatherBroadcast() {

    console.log("1. Connecting to Ollama...");

    
    try {
        const data = {
            riskScore: getRiskAdvanced(),
            alerts: getAlerts(),
            alertChanges: getAlertChanges()
        }

        // IMPORTANT: Make sure this name matches 'ollama list'
        const modelName = 'gemma4:e4b'; 

        console.log(`2. Requesting forecast from ${modelName}...`);

        const response = await ollama.chat({
        model: modelName,
        messages: [{ 
            role: 'user', 
            content: `
            This is the data you will use for the forecast. It is in JSON, and you will need to process the JSON data first.:
            ${JSON.stringify(data)}

            Write a short but detailed weather report and summary of at least 1 paragraph long using the data I gave you. Make it engaging and informative. 
            These are strict rules you must follow:
            - Do not mention that you are an AI model or that you are using Ollama.
            - Do not mention the name of the model or that you are an AI.
            - You will just give the forecast as if you were a real weatherman.
            - You will be lighthearted and funny, unless the weather is severe, in which case you will be serious and informative.
            - You will not include any disclaimers or explanations about how you generated the forecast.
            - You will not mention that the forecast is generated.
            - You will use a quantifying score called the weather risk score that I provided in the data section, where 0-29 is Normal Weather, 30-59 is Minor Weather, 60-89 is Moderate Weather, 90-120 is severe weather, and 120+ is extreme weather. You will include this score in the forecast and explain why events are contributing to it. You will mention why you think the score will increase or decrease based on past summaries you made.
            - You will not make your own weather risk score, but you will use the one I gave you to inform your forecast. You will explain how the events and their severity and certainty contribute to the risk score. You will also mention any potential changes in the risk score based on the current events and their trends.
            - You will use the following data to inform your forecast, but you will not mention the data directly. Instead, you will use it to create a forecast that is engaging and informative. You will not just list the data, but you will use it to create a narrative about the weather. You will mention any potential hazards and how they might impact people. You will also mention any interesting or unusual weather phenomena that might occur.
            - You will only prioritize alerts that are higher in their raw risk score, but you will also consider the number of alerts and the types of alerts.
            - If there is no data, you will talk about nice weather and how it's a good day to be outside. You will also mention that there are no alerts and that the risk score is low, but you will not mention the risk score directly.
            - If there are changes in the alerts, you will mention the changes and how they might impact the forecast. You will also mention any trends in the alerts and how they might impact the forecast. You will not just list the changes, but you will use them to inform your forecast and make it more engaging and informative.
            - If any alerts have an area of effect in Greenup, you will always mention those alerts in the forecast.
            - You will mention and describe at least the top 3 most severe alerts in the forecast, and you will explain how they contribute to the risk score and the potential hazards they might cause. You will also mention any trends in these alerts and how they might impact the forecast.
            - You will always mention changes in a seperate paragraph.
            ` 
        }],
        stream: true, // We use streaming so we see progress
        });

        console.log("3. AI is thinking... Response below:\n");
        console.log("------------------------------------");

        for await (const chunk of response) {
        process.stdout.write(chunk.message.content);
        }

        console.log("\n------------------------------------");
        console.log("\n4. Broadcast Complete.");

    } catch (error) {
        console.error("\n!! ERROR !!");
        console.log(error.message);
    }
}

module.exports = createScheduledBroadcast;