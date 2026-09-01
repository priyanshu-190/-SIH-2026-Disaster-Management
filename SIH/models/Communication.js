const mongoose = require("mongoose");

const communicationSchema = new mongoose.Schema(
    {

        // =========================================================
        // INCIDENT
        // =========================================================

        incidentId: {
            type: String,
            required: true,
            index: true
        },


        // =========================================================
        // MISSION
        // =========================================================

        missionId: {
            type: String,
            default: null,
            index: true
        },


        // =========================================================
        // TEAM
        // =========================================================

        teamId: {
            type: String,
            required: true,
            index: true
        },


        // =========================================================
        // WHO SENT THE MESSAGE?
        // =========================================================

        senderType: {
            type: String,
            enum: [
                "TEAM",
                "AUTHORITY",
                "SYSTEM"
            ],
            required: true
        },


        sender: {
            type: String,
            required: true
        },


        // =========================================================
        // MESSAGE
        // =========================================================

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000
        },


        // =========================================================
        // COMMUNICATION TYPE
        // =========================================================

        type: {
            type: String,
            enum: [
                "UPDATE",
                "ASSISTANCE_REQUEST",
                "EMERGENCY",
                "INSTRUCTION",
                "STATUS",
                "GENERAL"
            ],
            default: "GENERAL"
        },


        // =========================================================
        // PRIORITY
        // =========================================================

        priority: {
            type: String,
            enum: [
                "LOW",
                "NORMAL",
                "HIGH",
                "CRITICAL"
            ],
            default: "NORMAL"
        },


        // =========================================================
        // READ STATUS
        // =========================================================

        readByAuthority: {
            type: Boolean,
            default: false
        },

        readByTeam: {
            type: Boolean,
            default: false
        }

    },
    {
        timestamps: true
    }
);


module.exports =
    mongoose.model(
        "Communication",
        communicationSchema
    );