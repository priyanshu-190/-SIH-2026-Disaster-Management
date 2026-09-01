const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
    {
        teamId: {
            type: String,
            required: true,
            unique: true
        },

        name: {
            type: String,
            required: true
        },

        organization: {
            type: String,
            required: true,
            enum: [
                "NDRF",
                "SDRF",
                "FIRE",
                "AMBULANCE",
                "POLICE"
            ]
        },

        lat: {
            type: Number,
            required: true
        },

        lng: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "AVAILABLE",
                "BUSY",
                "OFFLINE"
            ],
            default: "AVAILABLE"
        },

        load: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        capabilities: {
            type: [String],
            default: []
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Team", teamSchema);