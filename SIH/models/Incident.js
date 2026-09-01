const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema(
    {
        incidentId: {
            type: String,
            required: true,
            unique: true
        },

        title: {
            type: String,
            required: true
        },

        type: {
            type: String,
            required: true,
            enum: ["Flood", "Fire", "Landslide", "Earthquake", "Other"]
        },

        priority: {
            type: String,
            required: true,
            enum: ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
        },

        description: {
            type: String,
            default: ""
        },

        lat: {
            type: Number,
            required: true
        },

        lng: {
            type: Number,
            required: true
        },

        // ============================================================
        // CURRENT POPULATION
        // ============================================================

        people: {
            type: Number,
            default: 0
        },

        estimatedPeople: {
            type: Number,
            default: 0
        },

        verifiedPeople: {
            type: Number,
            default: null
        },

        peopleVerified: {
            type: Boolean,
            default: false
        },

        children: {
            type: Number,
            default: 0
        },

        trapped: {
            type: Boolean,
            default: false
        },

        injured: {
            type: Number,
            default: 0
        },

        // ============================================================
        // CITIZEN REPORTS
        // ============================================================

        reportCount: {
            type: Number,
            default: 0
        },

        // ============================================================
        // CAPABILITIES
        // ============================================================

        capabilities: {
            type: [String],
            default: []
        },

        // ============================================================
        // INCIDENT STATUS
        // ============================================================

        status: {
            type: String,
            enum: ["ACTIVE", "RESOLVED", "CLOSED"],
            default: "ACTIVE"
        },

        // ============================================================
        // RESOLUTION
        // ============================================================

        resolution: {
            type: String,
            enum: [
                "AREA_SAFE",
                "RESCUE_COMPLETED"
            ],
            default: null
        },

        resolvedAt: {
            type: Date,
            default: null
        },

        resolvedBy: {
            type: String,
            default: "Authority"
        },

        peopleRescued: {
            type: Number,
            default: 0
        },

        // ============================================================
        // RESCUE TIMING
        // ============================================================

        rescueStartedAt: {
            type: Date,
            default: null
        },

        rescueCompletedAt: {
            type: Date,
            default: null
        },

        // ============================================================
        // INCIDENT TIMELINE
        // ============================================================

        timeline: [
            {
                event: {
                    type: String,
                    required: true
                },

                timestamp: {
                    type: Date,
                    default: Date.now
                },

                performedBy: {
                    type: String,
                    default: "System"
                },

                details: {
                    type: String,
                    default: ""
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Incident", incidentSchema);