const generateArrayObjectFromKeys = (object) => {
    const array = Object.entries(object).map(([key, value]) => {
        return {
            name: key,
            value: value
        }
    })
    return array;
}

const EVENT = {
    "severe thunderstorm warning": 0.6,
    "severe thunderstorm watch": 0.6,
    "special weather statement": 0.2,
    'tornado emergency': 2.0,
    "tornado warning": 1.0,
    "tornado watch": 0.6,
    "flash flood warning": 0.7,
    "wind advisory": 0.3,
    'small craft advisory': 0.1,
    'gale watch': 0.1,
    'gale warning': 0.1,
    'brisk wind advisory': 0.1,
    'high wind watch': 0.3,
    'fire weather watch': 0.1,
    'flood watch': 0.3,
    'heat advisory': 0.1,
    'winter weather advisory': 0.2,
    'rip current statement': 0.1,
    'heavy freezing spray warning': 0.6,
    'flood warning': 0.1,
    'red flag warning': 0.01,
    'special marine warning': 0.1,
    'flood advisory': 0.1,
    'freeze warning': 0.3,
    'fire weather warning': 0.1,
    'marine weather statement': 0.1,
    'lake wind advisory': 0.1,
    'dense fog advisory': 0.1,
    'dense smoke advisory': 0.1,
    'ice storm warning': 0.2,
    'winter storm watch': 0.2,
}

console.log(generateArrayObjectFromKeys(EVENT))

module.exports = { generateArrayObjectFromKeys }