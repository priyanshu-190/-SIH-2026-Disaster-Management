const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({

    // ============================================================
    // INCIDENT INFORMATION
    // ============================================================

    incidentType: {
        type: String,
        required: true
    },

    urgency: {
        type: String,
        required: true
    },


    // ============================================================
    // LOCATION
    // ============================================================

    location: {

        latitude: {
            type: Number,
            required: true
        },

        longitude: {
            type: Number,
            required: true
        }

    },


    // ============================================================
    // PEOPLE AFFECTED
    // ============================================================

    peopleCount: {

        type: Number,

        required: true,

        min: 1,

        max: 1000

    },


    // ============================================================
    // CITIZEN INFORMATION
    // ============================================================

    description: {
        type: String,
        required: true
    },

    photo: {
        type: String,
        default: null
    },


    // ============================================================
    // REPORT STATUS
    // ============================================================

    status: {
        type: String,
        default: 'pending'
    },


    // ============================================================
    // LINK TO CLUSTERED INCIDENT
    // ============================================================

    incidentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident',
        default: null
    },


    // ============================================================
    // AI / ML INPUTS
    // ============================================================

    mlInputs: {

        citizenSeverity: {
            type: String,
            default: null
        },

        nearbyReports: {
            type: Number,
            default: 0
        },

        disasterType: {
            type: String,
            default: null
        },

        populationDensity: {
            type: Number,
            default: 0
        },

        distanceCriticalInfra: {
            type: Number,
            default: 0
        },

        alertIntensity: {
            type: Number,
            default: 0
        },

        peopleAffected: {
            type: Number,
            default: 0
        },

        historicalRisk: {
            type: Number,
            default: 0
        }

    },


    // ============================================================
    // AI / ML OUTPUT
    // ============================================================

    severityScore: {

        type: Number,

        min: 0,

        max: 100,

        default: null

    },

    severityLevel: {

        type: String,

        enum: [
            "Low",
            "Moderate",
            "Medium",
            "High",
            "Severe",
            "Critical"
        ],

        default: null

    }

}, {

    timestamps: true

});


module.exports =
    mongoose.model('Report', reportSchema);