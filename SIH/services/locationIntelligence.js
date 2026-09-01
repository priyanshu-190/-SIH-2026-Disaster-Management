const Report = require("../models/Report");


// ============================================================
// LOCATION INTELLIGENCE SERVICE
// ============================================================


// ------------------------------------------------------------
// Calculate distance between two coordinates in kilometres
// ------------------------------------------------------------

function getDistanceKm(lat1, lon1, lat2, lon2) {

    const R = 6371;

    const dLat =
        (lat2 - lat1) *
        Math.PI / 180;

    const dLon =
        (lon2 - lon1) *
        Math.PI / 180;

    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return R * c;
}


// ------------------------------------------------------------
// Get nearby reports
// ------------------------------------------------------------

async function getNearbyReports(
    latitude,
    longitude,
    radiusKm = 5
) {

    const reports =
        await Report.find({

            "location.latitude": {
                $gte: latitude - 0.1,
                $lte: latitude + 0.1
            },

            "location.longitude": {
                $gte: longitude - 0.1,
                $lte: longitude + 0.1
            }

        });


    let count = 0;


    for (const report of reports) {

        if (
            !report.location ||
            report.location.latitude === undefined ||
            report.location.longitude === undefined
        ) {

            continue;

        }


        const distance =
            getDistanceKm(
                latitude,
                longitude,
                report.location.latitude,
                report.location.longitude
            );


        if (distance <= radiusKm) {

            count++;

        }

    }


    return count;
}


// ------------------------------------------------------------
// Population density
// ------------------------------------------------------------
//
// For now this is a location-intelligence placeholder.
// We will connect a real population-density source later.
//
// The model expects population density as a numerical value.
// ------------------------------------------------------------

function getPopulationDensity(
    latitude,
    longitude
) {

    // Default baseline value.
    // This will be replaced by real geospatial population data.

    return 5000;
}


// ------------------------------------------------------------
// Distance from critical infrastructure
// ------------------------------------------------------------
//
// Returns an estimated distance in kilometres.
//
// We will connect actual hospitals, police stations,
// fire stations and other critical infrastructure later.
// ------------------------------------------------------------

function getDistanceFromCriticalInfrastructure(
    latitude,
    longitude
) {

    // Temporary baseline.
    // Later this will be calculated using actual
    // infrastructure coordinates.

    return 5;
}


// ------------------------------------------------------------
// Alert intensity
// ------------------------------------------------------------
//
// This will eventually use IMD / official disaster alerts.
//
// For now we use a neutral baseline so the ML pipeline
// can be connected without inventing an emergency alert.
// ------------------------------------------------------------

function getAlertIntensity() {

    return 0;
}


// ------------------------------------------------------------
// Historical risk
// ------------------------------------------------------------
//
// This will eventually come from a historical-risk database.
//
// For now use a neutral baseline.
// ------------------------------------------------------------

function getHistoricalRisk() {

    return 50;
}


// ============================================================
// MAIN LOCATION INTELLIGENCE FUNCTION
// ============================================================

async function getLocationIntelligence(
    latitude,
    longitude
) {

    const nearbyReports =
        await getNearbyReports(
            latitude,
            longitude
        );


    const populationDensity =
        getPopulationDensity(
            latitude,
            longitude
        );


    const distanceCriticalInfra =
        getDistanceFromCriticalInfrastructure(
            latitude,
            longitude
        );


    const alertIntensity =
        getAlertIntensity();


    const historicalRisk =
        getHistoricalRisk();


    return {

        nearbyReports,

        populationDensity,

        distanceCriticalInfra,

        alertIntensity,

        historicalRisk

    };

}


// ============================================================
// EXPORT
// ============================================================

module.exports = {

    getDistanceKm,

    getNearbyReports,

    getPopulationDensity,

    getDistanceFromCriticalInfrastructure,

    getAlertIntensity,

    getHistoricalRisk,

    getLocationIntelligence

};