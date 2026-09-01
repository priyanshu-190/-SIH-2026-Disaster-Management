const express = require("express");

const Mission = require("../models/Mission");
const Team = require("../models/Team");

const router = express.Router();


// =========================================================
// DISPATCH A TEAM TO AN INCIDENT
// =========================================================

router.post("/dispatch", async (req, res) => {

    try {

        const io = req.app.get("io");

        const {
            incidentId,
            teamId,
            etaMinutes,
            matchScore,
            distanceKm,
            instructions,
            incident
        } = req.body;


        // =====================================================
        // 1. VALIDATE INCIDENT ID
        // =====================================================

        if (!incidentId) {

            return res.status(400).json({

                message:
                    "Incident ID is required"

            });

        }


        // =====================================================
        // 2. VALIDATE TEAM ID
        // =====================================================

        if (!teamId) {

            return res.status(400).json({

                message:
                    "Team ID is required"

            });

        }


        // =====================================================
        // 3. CHECK TEAM
        // =====================================================

        const team =
            await Team.findOne({

                teamId:
                    teamId

            });


        if (!team) {

            return res.status(404).json({

                message:
                    "Team not found"

            });

        }


        // =====================================================
        // 4. CHECK TEAM AVAILABILITY
        // =====================================================

        if (
            String(team.status).toUpperCase() !==
            "AVAILABLE"
        ) {

            return res.status(400).json({

                message:
                    "Team is not available"

            });

        }


        // =====================================================
        // 5. INCIDENT DATA
        // =====================================================
        //
        // IMPORTANT:
        //
        // The Authority dashboard already sends the complete
        // incident inside req.body.incident.
        //
        // We therefore DO NOT require the incident to exist
        // separately in the Incident collection.
        //
        // =====================================================

        const incidentData =
            incident || {

                incidentId:
                    incidentId,

                title:
                    "Disaster Incident",

                type:
                    "Other",

                priority:
                    "MEDIUM",

                description:
                    "",

                lat:
                    0,

                lng:
                    0,

                people:
                    0,

                capabilities:
                    []

            };


        // =====================================================
        // 6. CREATE MISSION ID
        // =====================================================

        const missionId =
            `MIS-${Date.now()}`;


        // =====================================================
        // 7. CREATE MISSION
        // =====================================================

        const mission =
            await Mission.create({

                missionId,

                incidentId,

                teamId,

                status:
                    "ACCEPTED",

                etaMinutes:
                    Number(
                        etaMinutes
                    ) || 0,

                matchScore:
                    Number(
                        matchScore
                    ) || 0,

                distanceKm:
                    Number(
                        distanceKm
                    ) || 0,

                instructions:
                    instructions || "",

                dispatchedAt:
                    new Date()

            });


        // =====================================================
        // 8. UPDATE TEAM
        // =====================================================

        team.status =
            "BUSY";


        team.load =
            Math.min(

                100,

                Number(
                    team.load || 0
                ) + 30

            );


        await team.save();


        // =====================================================
        // 9. REAL-TIME ORDER
        // =====================================================

        const order = {

            missionId:
                mission.missionId,

            incidentId:
                incidentId,

            teamId:
                team.teamId,

            team: {

                teamId:
                    team.teamId,

                name:
                    team.name,

                organization:
                    team.organization,

                status:
                    team.status,

                load:
                    team.load,

                lat:
                    team.lat,

                lng:
                    team.lng

            },

            incident: {

                incidentId:
                    incidentId,

                title:
                    incidentData.title ||
                    "Disaster Incident",

                type:
                    incidentData.type ||
                    "Other",

                priority:
                    incidentData.priority ||
                    "MEDIUM",

                severityScore:
                    Number(
                        incidentData.severityScore ||
                        0
                    ),

                severityLevel:
                    incidentData.severityLevel ||
                    "Unknown",

                people:
                    Number(
                        incidentData.people ||
                        0
                    ),

                lat:
                    Number(
                        incidentData.lat ||
                        0
                    ),

                lng:
                    Number(
                        incidentData.lng ||
                        0
                    ),

                description:
                    incidentData.description ||
                    "",

                capabilities:
                    incidentData.capabilities ||
                    []

            },

            etaMinutes:
                mission.etaMinutes,

            matchScore:
                mission.matchScore,

            distanceKm:
                mission.distanceKm,

            instructions:
                mission.instructions,

            dispatchedAt:
                mission.dispatchedAt

        };


        // =====================================================
        // 10. LOG DISPATCH
        // =====================================================

        console.log(
            "========================================"
        );

        console.log(
            "🚨 NEW MISSION DISPATCHED"
        );

        console.log(
            "Mission:",
            mission.missionId
        );

        console.log(
            "Incident:",
            incidentId
        );

        console.log(
            "Team:",
            team.teamId
        );

        console.log(
            "Room:",
            `team:${team.teamId}`
        );

        console.log(
            "========================================"
        );


        // =====================================================
        // 11. SEND ONLY TO SELECTED TEAM
        // =====================================================

        if (io) {

            io.to(
                `team:${team.teamId}`
            ).emit(

                "newMissionOrder",

                order

            );


            console.log(
                `📡 Order sent to team:${team.teamId}`
            );

        }


        // =====================================================
        // 12. SEND RESPONSE TO AUTHORITY
        // =====================================================

        return res.status(201).json({

            success:
                true,

            message:
                "Team dispatched successfully",

            mission,

            team

        });


    } catch (error) {

        console.error(
            "❌ Dispatch error:",
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Failed to dispatch team",

            error:
                error.message

        });

    }

});


// =========================================================
// GET ALL MISSIONS
// =========================================================

router.get("/", async (req, res) => {

    try {

        const missions =
            await Mission
                .find()
                .sort({
                    createdAt: -1
                });


        return res.json(
            missions
        );


    } catch (error) {

        console.error(
            "❌ Mission fetch error:",
            error
        );


        return res.status(500).json({

            message:
                "Failed to fetch missions"

        });

    }

});


// =========================================================
// GET MISSIONS FOR A TEAM
// =========================================================

router.get(
    "/team/:teamId",
    async (req, res) => {

        try {

            const missions =
                await Mission
                    .find({

                        teamId:
                            req.params.teamId

                    })
                    .sort({

                        createdAt:
                            -1

                    });


            return res.json(
                missions
            );


        } catch (error) {

            console.error(
                "❌ Team mission fetch error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to fetch team missions"

            });

        }

    }
);


// =========================================================
// UPDATE MISSION STATUS
// =========================================================

router.patch(
    "/:missionId/status",
    async (req, res) => {

        try {

            const {
                status
            } = req.body;


            const allowedStatuses = [

                "ACCEPTED",

                "EN_ROUTE",

                "ARRIVED",

                "RESCUE_STARTED",

                "COMPLETE",

                "ESCALATED"

            ];


            if (
                !allowedStatuses.includes(
                    status
                )
            ) {

                return res.status(400).json({

                    message:
                        "Invalid mission status"

                });

            }


            // =================================================
            // FIND MISSION
            // =================================================

            const mission =
                await Mission.findOne({

                    missionId:
                        req.params.missionId

                });


            if (!mission) {

                return res.status(404).json({

                    message:
                        "Mission not found"

                });

            }


            // =================================================
            // UPDATE STATUS
            // =================================================

            mission.status =
                status;


            if (
                status ===
                "ARRIVED"
            ) {

                mission.arrivedAt =
                    new Date();

            }


            if (
                status ===
                "COMPLETE"
            ) {

                mission.completedAt =
                    new Date();

            }


            await mission.save();


            // =================================================
            // UPDATE TEAM
            // =================================================

            let team =
                await Team.findOne({

                    teamId:
                        mission.teamId

                });


            if (
                status ===
                "COMPLETE"
            ) {

                if (team) {

                    team.status =
                        "AVAILABLE";


                    team.load =
                        Math.max(

                            0,

                            Number(
                                team.load || 0
                            ) - 30

                        );


                    await team.save();

                }

            }


            // =================================================
            // REFRESH TEAM
            // =================================================

            team =
                await Team.findOne({

                    teamId:
                        mission.teamId

                });


            // =================================================
            // REAL-TIME STATUS UPDATE
            // =================================================
// =====================================================
// REAL-TIME STATUS UPDATE
// =====================================================

const io =
    req.app.get("io");


if (io) {

    const statusUpdate = {

        missionId:
            mission.missionId,

        incidentId:
            mission.incidentId,

        teamId:
            mission.teamId,

        status:
            mission.status,

        team

    };


    // ---------------------------------------------------------
    // SEND UPDATE TO THE SELECTED RELIEF TEAM
    // ---------------------------------------------------------

    io.to(
        `team:${mission.teamId}`
    ).emit(
        "missionStatusUpdated",
        statusUpdate
    );


    // ---------------------------------------------------------
    // SEND UPDATE TO AUTHORITY DASHBOARD
    // ---------------------------------------------------------

    io.emit(
        "missionStatusUpdated",
        statusUpdate
    );

}

            // =================================================
            // RESPONSE
            // =================================================

            return res.json({

                success:
                    true,

                message:
                    "Mission status updated successfully",

                mission,

                team

            });


        } catch (error) {

            console.error(
                "❌ Status update error:",
                error
            );


            return res.status(500).json({

                message:
                    "Failed to update mission status",

                error:
                    error.message

            });

        }

    }
);


// =========================================================
// EXPORT
// =========================================================

module.exports =
    router;