const Report = require('../models/Report');
const cloudinary = require('../config/cloudinary');

const {
    predictSeverity
} = require('../services/severityService');

const {
    getLocationIntelligence
} = require('../services/locationIntelligence');


// ============================================================
// CREATE NEW REPORT
// ============================================================

exports.createReport = async (req, res) => {

    try {

        // ========================================================
        // LOCATION
        // ========================================================

        const location =
            JSON.parse(req.body.location);


        const latitude =
            Number(location.latitude);

        const longitude =
            Number(location.longitude);


        // ========================================================
        // BASIC CITIZEN INPUTS
        // ========================================================

        const incidentType =
            req.body.incidentType;

        const urgency =
            req.body.urgency;

        const peopleCount =
            Number(req.body.peopleCount);

        const description =
            req.body.description;


        // ========================================================
        // UPLOAD PHOTO TO CLOUDINARY
        // ========================================================

        let photoUrl = null;


        if (req.file) {

            const result =
                await new Promise(
                    (resolve, reject) => {

                        const stream =
                            cloudinary.uploader.upload_stream(
                                {
                                    folder:
                                        'disaster-relief-reports'
                                },

                                (error, result) => {

                                    if (error) {

                                        reject(error);

                                    } else {

                                        resolve(result);

                                    }

                                }
                            );


                        stream.end(
                            req.file.buffer
                        );

                    }
                );


            photoUrl =
                result.secure_url;

        }


        // ========================================================
        // GET LOCATION INTELLIGENCE
        // ========================================================

        const locationData =
            await getLocationIntelligence(
                latitude,
                longitude
            );


        // ========================================================
        // PREPARE ALL 8 ML INPUTS
        // ========================================================

        const mlInputs = {

            citizenSeverity:
                urgency,

            nearbyReports:
                locationData.nearbyReports,

            disasterType:
                incidentType,

            populationDensity:
                locationData.populationDensity,

            distanceCriticalInfra:
                locationData.distanceCriticalInfra,

            alertIntensity:
                locationData.alertIntensity,

            peopleAffected:
                peopleCount,

            historicalRisk:
                locationData.historicalRisk

        };


        console.log(
            "ML INPUTS:",
            mlInputs
        );


        // ========================================================
        // CALL SEVERITY AI
        // ========================================================

        const severityResult =
            await predictSeverity(
                mlInputs
            );


        console.log(
            "AI SEVERITY RESULT:",
            severityResult
        );


        // ========================================================
        // CREATE REPORT
        // ========================================================

        const report =
            await Report.create({

                incidentType,

                urgency,

                location: {

                    latitude,

                    longitude

                },

                peopleCount,

                description,

                photo: photoUrl,

                status: 'pending',


                // =================================================
                // SAVE ALL ML INPUTS
                // =================================================

                mlInputs: {

                    citizenSeverity:
                        mlInputs.citizenSeverity,

                    nearbyReports:
                        mlInputs.nearbyReports,

                    disasterType:
                        mlInputs.disasterType,

                    populationDensity:
                        mlInputs.populationDensity,

                    distanceCriticalInfra:
                        mlInputs.distanceCriticalInfra,

                    alertIntensity:
                        mlInputs.alertIntensity,

                    peopleAffected:
                        mlInputs.peopleAffected,

                    historicalRisk:
                        mlInputs.historicalRisk

                },


                // =================================================
                // SAVE AI OUTPUT
                // =================================================

                severityScore:
                    severityResult.severityScore,

                severityLevel:
                    severityResult.severityLevel

            });


        // ========================================================
        // SUCCESS RESPONSE
        // ========================================================

        res.status(201).json({

            success: true,

            report

        });


    } catch (err) {

        console.error(
            "Create report error:",
            err
        );


        res.status(400).json({

            success: false,

            message:
                err.message

        });

    }

};