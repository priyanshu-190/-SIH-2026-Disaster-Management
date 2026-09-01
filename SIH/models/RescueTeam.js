const mongoose = require("mongoose");

const rescueTeamSchema = new mongoose.Schema(
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
            required: true
        },

        password: {
            type: String,
            required: true
        },

        lat: {
            type: Number
        },

        lng: {
            type: Number
        },

        status: {
            type: String,
            default: "Available"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("RescueTeam", rescueTeamSchema);