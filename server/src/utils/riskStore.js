let risk = 0;
let inDepthRisk = {};
let thirtyMinuteRisk = [];
let alerts = [];

let alertChanges = [];

const getRisk = () => {
    return risk;
}

const setRisk = (r) => {
    risk = r;
    addData(r);
}

const setRiskAdvanced = (r) => {
    r.thirtyMinuteRisk = thirtyMinuteRisk;
    inDepthRisk = r;
}

const getRiskAdvanced = () => {
    return inDepthRisk;
}

const getAlerts = () => {
    return alerts;
}

const setAlerts = (newAlerts) => {
    const result = compareAlerts(alerts, newAlerts);

    const changedAlerts = [
        ...result.added.map(a => ({ ...a, _type: "new" })),
        ...result.updated.map(u => ({
            ...u.after,
            _type: "updated",
            _delta: u.after.adjustedRisk - u.before.adjustedRisk
        })),
        ...result.removed.map(a => ({ ...a, _type: "removed" }))
    ];

    if (changedAlerts.length > 0) {
        alertChanges = changedAlerts;
    }

    // Update main alerts
    alerts = newAlerts;
};

const getAlertChanges = () => {
    return alertChanges;
};

function addData(data) {
  const now = Date.now();
  // 1. Add new data with timestamp
  thirtyMinuteRisk.push({
    data: data,
    timestamp: now
  });

  // 2. Remove data older than 30 minutes (30 * 60 * 1000 = 1,800,000 ms)
  const thirtyMinutesAgo = now - (30 * 60 * 1000);
  thirtyMinuteRisk = thirtyMinuteRisk.filter(item => item.timestamp > thirtyMinutesAgo);
}

function compareAlerts(oldArr = [], newArr = []) {
    const getKey = (a) => `${a.event}|${a.area}|${a.sender}|${a.headline}`;

    const oldMap = new Map(oldArr.map(a => [getKey(a), a]));
    const newMap = new Map(newArr.map(a => [getKey(a), a]));

    const added = [];
    const updated = [];
    const removed = [];

    for (const [key, newAlert] of newMap) {
        const oldAlert = oldMap.get(key);

        const hasChanged =
            !oldAlert ||
            oldAlert.adjustedRisk !== newAlert.adjustedRisk ||
            oldAlert.event !== newAlert.event ||
            oldAlert.area !== newAlert.area;

        if (!oldAlert) {
            added.push(newAlert);
        } else if (hasChanged) {
            updated.push({
                before: oldAlert,
                after: newAlert
            });
        }
    }

    for (const [key, oldAlert] of oldMap) {
        if (!newMap.has(key)) {
            removed.push(oldAlert);
        }
    }

    return { added, updated, removed };
}


module.exports = { getRisk, setRisk, getAlerts, setAlerts, setRiskAdvanced, getRiskAdvanced, getAlertChanges };