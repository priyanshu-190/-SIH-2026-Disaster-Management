const express = require('express');
const router = express.Router();
const { getAlertsForLocation } = require('../services/weatherAlertService');

router.get('/', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                message: "No location found"
            });
        }

        const alerts = await getAlertsForLocation(lat, lon);

        res.json({ success: true, alerts });

    } catch (err) {
        console.error("Alert fetch error:", err.message);
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;