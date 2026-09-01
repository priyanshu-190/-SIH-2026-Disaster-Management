const axios = require('axios');

const cache = new Map();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minute

function mapSeverity(severityText = "") {
    const text = severityText.toLowerCase();

    if (text.includes('extreme')) return 'Critical';
    if (text.includes('severe')) return 'High';
    if (text.includes('moderate')) return 'Medium';
    return 'Low';
}

async function getAlertsForLocation(lat, lon) {

    const key = `${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`;

    const cached = cache.get(key);

    if (cached && (Date.now() - cached.timestamp < CACHE_DURATION)) {
        return cached.data;
    }

    const response = await axios.get(
        'https://api.weatherapi.com/v1/alerts.json',
        {
            params: {
                key: process.env.WEATHER_API_KEY,
                q: `${lat},${lon}`
            }
        }
    );

    const rawAlerts = response.data?.alerts?.alert || [];

    const alerts = rawAlerts.map(alert => ({
        event: alert.headline || alert.event,
        description: alert.desc || alert.instruction || "No details available.",
        severity: mapSeverity(alert.severity),
        senderName: alert.msgtype || "Weather Authority",
        startTime: alert.effective,
        endTime: alert.expires
    }));

    cache.set(key, { data: alerts, timestamp: Date.now() });

    return alerts;
}

module.exports = { getAlertsForLocation };