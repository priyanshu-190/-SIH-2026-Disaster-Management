const express = require("express");
const Incident = require("../models/Incident");
const Report = require("../models/Report");
const Mission = require("../models/Mission");

const router = express.Router();


// ============================================================
// GET INCIDENTS
//
// /api/incidents
// /api/incidents?status=ACTIVE
// /api/incidents?status=RESOLVED
// /api/incidents?status=PAST
// ============================================================

router.get("/", async (req, res) => {

    try {

        const requestedStatus =
            String(req.query.status || "ACTIVE").toUpperCase();

        let query = {};

        if (requestedStatus === "PAST") {

            query = {
                status: {
                    $in: ["RESOLVED", "CLOSED"]
                }
            };

        } else if (
            ["ACTIVE", "RESOLVED", "CLOSED"].includes(
                requestedStatus
            )
        ) {

            query = {
                status: requestedStatus
            };

        }

        const incidents = await Incident
            .find(query)
            .sort({ createdAt: -1 })
            .lean();

        res.json(
            incidents.map(incident => {

                const affectedPeople =
                    incident.peopleVerified &&
                    incident.verifiedPeople !== null
                        ? incident.verifiedPeople
                        : incident.estimatedPeople;

                return {
                    ...incident,
                    people:
                        affectedPeople ||
                        incident.people ||
                        0
                };

            })
        );

    } catch (error) {

        console.error(
            "Error fetching incidents:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch incidents"
        });

    }

});


// ============================================================
// GET ONE INCIDENT
// ============================================================

router.get("/:id", async (req, res) => {

    try {

        const incident =
            await Incident.findOne({
                incidentId: req.params.id
            }).lean();

        if (!incident) {

            return res.status(404).json({
                message: "Incident not found"
            });

        }

        const reports =
            await Report.find({
                incidentId: incident._id
            })
            .sort({ createdAt: 1 })
            .lean();

        const missions =
            await Mission.find({
                incidentId: incident.incidentId
            })
            .sort({ createdAt: 1 })
            .lean();

        const affectedPeople =
            incident.peopleVerified &&
            incident.verifiedPeople !== null
                ? incident.verifiedPeople
                : incident.estimatedPeople;

        res.json({
            ...incident,

            people:
                affectedPeople ||
                incident.people ||
                0,

            reports,

            missions
        });

    } catch (error) {

        console.error(
            "Error fetching incident:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch incident"
        });

    }

});


// ============================================================
// RESOLVE INCIDENT
//
// AREA SAFE
// RESCUE COMPLETED
// ============================================================

router.patch("/:id/resolve", async (req, res) => {

    try {

        const {
            resolution,
            resolvedBy,
            peopleRescued
        } = req.body;

        const allowedResolutions = [
            "AREA_SAFE",
            "RESCUE_COMPLETED"
        ];

        if (
            !allowedResolutions.includes(
                String(resolution).toUpperCase()
            )
        ) {

            return res.status(400).json({
                message:
                    "Invalid resolution. Use AREA_SAFE or RESCUE_COMPLETED."
            });

        }

        const incident =
            await Incident.findOne({
                incidentId: req.params.id
            });

        if (!incident) {

            return res.status(404).json({
                message: "Incident not found"
            });

        }

        if (
            incident.status === "RESOLVED" ||
            incident.status === "CLOSED"
        ) {

            return res.status(400).json({
                message: "Incident is already resolved."
            });

        }

        const now = new Date();

        const finalResolution =
            String(resolution).toUpperCase();

        // --------------------------------------------------------
        // UPDATE INCIDENT
        // --------------------------------------------------------

        incident.status = "RESOLVED";

        incident.resolution =
            finalResolution;

        incident.resolvedAt =
            now;

        incident.resolvedBy =
            resolvedBy ||
            "Authority";

        if (
            finalResolution ===
            "RESCUE_COMPLETED"
        ) {

            incident.rescueCompletedAt =
                now;

            if (!incident.rescueStartedAt) {

                incident.rescueStartedAt =
                    now;

            }

            incident.peopleRescued =
                Number(
                    peopleRescued ??
                    incident.people ??
                    0
                );

        }

        // --------------------------------------------------------
        // TIMELINE
        // --------------------------------------------------------

        incident.timeline.push({

            event:
                finalResolution === "AREA_SAFE"
                    ? "AREA_DECLARED_SAFE"
                    : "RESCUE_COMPLETED",

            timestamp: now,

            performedBy:
                resolvedBy ||
                "Authority",

            details:
                finalResolution === "AREA_SAFE"
                    ? "Authority declared the incident area safe."
                    : `Rescue completed. ${Number(
                        peopleRescued ??
                        incident.people ??
                        0
                    )} people rescued.`

        });

        await incident.save();

        // --------------------------------------------------------
        // UPDATE LINKED REPORTS
        //
        // Reports remain stored.
        // We only mark them as resolved.
        // --------------------------------------------------------

        await Report.updateMany(

            {
                incidentId:
                    incident._id
            },

            {
                $set: {
                    status: "resolved"
                }
            }

        );

        // --------------------------------------------------------
        // SOCKET.IO
        // --------------------------------------------------------

        const io =
            req.app.get("io");

        if (io) {

            io.emit(
                "incidentResolved",
                {
                    incidentId:
                        incident.incidentId,

                    resolution:
                        finalResolution,

                    resolvedAt:
                        incident.resolvedAt
                }
            );

        }

        res.json({

            success: true,

            message:
                "Incident resolved successfully",

            incident

        });

    } catch (error) {

        console.error(
            "Resolve incident error:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to resolve incident"

        });

    }

});


module.exports = router;