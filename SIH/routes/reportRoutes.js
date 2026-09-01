const express = require('express');
const multer = require('multer');
const router = express.Router();

const { createReport } = require('../controllers/reportController');
const Report = require('../models/Report');
const Incident = require('../models/Incident');
const upload = multer({
    storage: multer.memoryStorage()
});


// ============================================================
// CREATE NEW REPORT
// ============================================================

router.post(
    '/',
    upload.single('photo'),
    createReport
);


// ============================================================
// GET ALL ORIGINAL REPORTS
//
// IMPORTANT:
// Every citizen report remains stored.
// Every photo remains stored.
// ============================================================

router.get('/', async (req, res) => {

    try {

        const reports = await Report
            .find()
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            reports
        });

    } catch (error) {

        console.error(
            "Error fetching reports:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch reports"
        });

    }

});


// ============================================================
// GET DEDUPLICATED / GROUPED INCIDENTS
//
// Reports are grouped when:
//
// 1. Same incident type
// 2. Locations are within 1 KM
//
// IMPORTANT:
// We DO NOT add peopleCount from every report.
//
// Example:
//
// Report 1 = 500
// Report 2 = 324
// Report 3 = 356
// Report 4 = 503
//
// OLD RESULT:
// 500 + 324 + 356 + 503 = 1683 ❌
//
// NEW RESULT:
// MAX(500, 324, 356, 503) = 503 ✅
//
// This prevents multiple citizens reporting the same
// affected population from inflating the total.
// ============================================================

router.get('/grouped', async (req, res) => {

    try {

        // ========================================================
        // ONLY GROUP ACTIVE / UNRESOLVED REPORTS
        // ========================================================

        const reports = await Report
            .find({
                status: {
                    $ne: "resolved"
                }
            })
            .sort({
                createdAt: -1
            })
            .lean();


        const groups = [];

        const DISTANCE_LIMIT_KM = 1;


        // ========================================================
        // DISTANCE CALCULATION
        // ========================================================

        function getDistanceKm(
            lat1,
            lon1,
            lat2,
            lon2
        ) {

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

                Math.cos(
                    lat1 * Math.PI / 180
                ) *

                Math.cos(
                    lat2 * Math.PI / 180
                ) *

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


        // ========================================================
        // GROUP REPORTS
        // ========================================================

        for (const report of reports) {

            const reportLat =
                Number(
                    report.location.latitude
                );

            const reportLng =
                Number(
                    report.location.longitude
                );


            let matchingGroup = null;


            // ====================================================
            // FIND MATCHING GROUP
            // ====================================================

            for (const group of groups) {

                if (
                    group.incidentType.toLowerCase() !==
                    report.incidentType.toLowerCase()
                ) {

                    continue;

                }


                const distance =
                    getDistanceKm(
                        group.latitude,
                        group.longitude,
                        reportLat,
                        reportLng
                    );


                if (
                    distance <=
                    DISTANCE_LIMIT_KM
                ) {

                    matchingGroup =
                        group;

                    break;

                }

            }


            // ====================================================
            // ADD TO EXISTING GROUP
            // ====================================================

            if (matchingGroup) {

                matchingGroup.reports.push(
                    report
                );

                matchingGroup.reportCount =
                    matchingGroup.reports.length;


                // ------------------------------------------------
                // PEOPLE
                // ------------------------------------------------

                const reportedPeople =
                    Number(
                        report.peopleCount || 0
                    );

                const currentPeople =
                    Number(
                        matchingGroup.peopleCount || 0
                    );


                if (
                    reportedPeople >
                    currentPeople
                ) {

                    matchingGroup.peopleCount =
                        reportedPeople;

                }


                // ------------------------------------------------
                // AI SEVERITY
                // ------------------------------------------------

                const reportSeverity =
                    Number(
                        report.severityScore || 0
                    );

                const currentSeverity =
                    Number(
                        matchingGroup.severityScore || 0
                    );


                if (
                    reportSeverity >
                    currentSeverity
                ) {

                    matchingGroup.severityScore =
                        reportSeverity;

                    matchingGroup.severityLevel =
                        report.severityLevel ||
                        null;

                }


                // ------------------------------------------------
                // URGENCY
                // ------------------------------------------------

                const urgencyRank = {

                    low: 1,
                    medium: 2,
                    high: 3,
                    critical: 4

                };


                const reportUrgency =
                    report.urgency
                        ?.toLowerCase();

                const groupUrgency =
                    matchingGroup.urgency
                        ?.toLowerCase();


                if (
                    (urgencyRank[
                        reportUrgency
                    ] || 0) >

                    (urgencyRank[
                        groupUrgency
                    ] || 0)
                ) {

                    matchingGroup.urgency =
                        report.urgency;

                }

            }


            // ====================================================
            // CREATE NEW GROUP
            // ====================================================

            else {

                groups.push({

                    groupId: null,

                    incidentType:
                        report.incidentType,

                    urgency:
                        report.urgency,

                    latitude:
                        reportLat,

                    longitude:
                        reportLng,

                    peopleCount:
                        Number(
                            report.peopleCount || 0
                        ),

                    severityScore:
                        Number(
                            report.severityScore || 0
                        ),

                    severityLevel:
                        report.severityLevel ||
                        null,

                    reportCount: 1,

                    reports: [
                        report
                    ]

                });

            }

        }


        // ========================================================
        // CREATE / REUSE PERSISTENT INCIDENTS
        // ========================================================

        for (const group of groups) {

            // ----------------------------------------------------
            // CHECK WHETHER ONE OF THE REPORTS ALREADY BELONGS
            // TO AN ACTIVE INCIDENT
            // ----------------------------------------------------

            let existingIncidentId = null;


            for (
                const report of group.reports
            ) {

                if (report.incidentId) {

                    const existingIncident =
                        await Incident.findById(
                            report.incidentId
                        ).lean();


                    if (
                        existingIncident &&
                        (
                            existingIncident.status ===
                            "ACTIVE"
                        )
                    ) {

                        existingIncidentId =
                            existingIncident.incidentId;

                        break;

                    }

                }

            }


            let incident;


            // ====================================================
            // REUSE EXISTING INCIDENT
            // ====================================================

            if (existingIncidentId) {

                incident =
                    await Incident.findOne({

                        incidentId:
                            existingIncidentId

                    });

            }


            // ====================================================
            // CREATE NEW PERSISTENT INCIDENT
            // ====================================================

            else {

                const count =
                    await Incident.countDocuments();


                const incidentId =
                    `INC-${new Date().getFullYear()}-${String(
                        count + 1
                    ).padStart(4, "0")}`;


                const priorityMap = {

                    low: "LOW",

                    medium: "MEDIUM",

                    high: "HIGH",

                    critical: "CRITICAL"

                };


                const priority =
                    priorityMap[
                        group.urgency
                            ?.toLowerCase()
                    ] ||
                    "MEDIUM";


                incident =
                    await Incident.create({

                        incidentId,

                        title:
                            `${group.incidentType} Incident`,

                        type:
                            [
                                "Flood",
                                "Fire",
                                "Landslide",
                                "Earthquake",
                                "Other"
                            ].includes(
                                group.incidentType
                            )
                                ? group.incidentType
                                : "Other",

                        priority,

                        description:
                            group.reports[0]
                                ?.description ||
                            "",

                        lat:
                            group.latitude,

                        lng:
                            group.longitude,

                        people:
                            group.peopleCount,

                        estimatedPeople:
                            group.peopleCount,

                        reportCount:
                            group.reportCount,

                        status:
                            "ACTIVE",

                        timeline: [

                            {

                                event:
                                    "INCIDENT_REPORTED",

                                timestamp:
                                    group.reports[
                                        group.reports.length - 1
                                    ]?.createdAt ||
                                    new Date(),

                                performedBy:
                                    "Citizen",

                                details:
                                    `${group.reportCount} citizen report(s) received.`

                            }

                        ]

                    });

            }


            // ====================================================
            // UPDATE INCIDENT WITH LATEST GROUP INFORMATION
            // ====================================================

            const priorityMap = {

                low: "LOW",

                medium: "MEDIUM",

                high: "HIGH",

                critical: "CRITICAL"

            };


            incident.people =
                group.peopleCount;

            incident.estimatedPeople =
                group.peopleCount;

            incident.reportCount =
                group.reportCount;

            incident.lat =
                group.latitude;

            incident.lng =
                group.longitude;

            incident.priority =
                priorityMap[
                    group.urgency
                        ?.toLowerCase()
                ] ||
                incident.priority ||
                "MEDIUM";


            await incident.save();


            // ====================================================
            // LINK EVERY REPORT TO THIS INCIDENT
            // ====================================================

            await Report.updateMany(

                {
                    _id: {
                        $in:
                            group.reports.map(
                                report =>
                                    report._id
                            )
                    }
                },

                {
                    $set: {
                        incidentId:
                            incident._id
                    }
                }

            );


            // ====================================================
            // RETURN PERSISTENT INCIDENT ID TO FRONTEND
            // ====================================================

            group.groupId =
                incident.incidentId;

            group.incidentId =
                incident.incidentId;

            group.status =
                incident.status;

            group.resolution =
                incident.resolution;

        }


        // ========================================================
        // RESPONSE
        // ========================================================

        res.json({

            success: true,

            groups

        });


    } catch (error) {

        console.error(
            "Error grouping reports:",
            error
        );

        res.status(500).json({

            success: false,

            message:
                "Failed to group incidents"

        });

    }

});


// ============================================================
// INCIDENT REPORTS PAGE
// ============================================================

router.get(
    "/incident-reports",
    (req, res) => {

        res.render(
            "incident_reports"
        );

    }
);


module.exports = router;