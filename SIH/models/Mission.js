const mongoose = require("mongoose");


const missionSchema =
    new mongoose.Schema(

        {

            // =================================================
            // MISSION ID
            // =================================================

            missionId: {

                type: String,

                required: true,

                unique: true

            },


            // =================================================
            // INCIDENT
            // =================================================

            incidentId: {

                type: String,

                required: true

            },


            // =================================================
            // TEAM
            // =================================================

            teamId: {

                type: String,

                required: true

            },


            // =================================================
            // MISSION STATUS
            // =================================================

            status: {

                type: String,

                enum: [

                    "WAITING",

                    "ACCEPTED",

                    "EN_ROUTE",

                    "ARRIVED",

                    "RESCUE",

                    "RESCUE_STARTED",

                    "COMPLETE",

                    "ESCALATED"

                ],

                default:
                    "WAITING"

            },


            // =================================================
            // ETA
            // =================================================

            etaMinutes: {

                type: Number,

                default: 0

            },


            // =================================================
            // AI MATCH SCORE
            // =================================================

            matchScore: {

                type: Number,

                min: 0,

                max: 100,

                default: 0

            },


            // =================================================
            // DISTANCE
            // =================================================

            distanceKm: {

                type: Number,

                default: 0

            },


            // =================================================
            // AUTHORITY INSTRUCTIONS
            // =================================================

            instructions: {

                type: String,

                default: ""

            },


            // =================================================
            // TIMESTAMPS
            // =================================================

            dispatchedAt: {

                type: Date,

                default: null

            },


            arrivedAt: {

                type: Date,

                default: null

            },


            completedAt: {

                type: Date,

                default: null

            }

        },

        {

            timestamps: true

        }

    );


module.exports =
    mongoose.model(
        "Mission",
        missionSchema
    );