const express = require("express");
const router = express.Router();

const Shelter = require("../models/Shelter");


// ============================================================
// GET ALL SHELTERS
// ============================================================

router.get("/", async (req, res) => {

    try {

        const shelters = await Shelter
            .find()
            .sort({ name: 1 });

        res.json({
            success: true,
            shelters
        });

    } catch (error) {

        console.error(
            "Error fetching shelters:",
            error
        );

        res.status(500).json({
            success: false,
            message: "Failed to fetch shelters"
        });

    }

});


// ============================================================
// ASSIGN PEOPLE TO SHELTER
//
// POST /api/shelters/:shelterId/assign
//
// Body:
// {
//     "people": 50
// }
//
// This reduces availableCapacity by the assigned amount.
// ============================================================

router.post("/:shelterId/assign", async (req, res) => {

    try {

        const shelterId =
            req.params.shelterId;

        const people =
            Number(req.body.people);


        // ========================================================
        // VALIDATE NUMBER OF PEOPLE
        // ========================================================

        if (
            !Number.isInteger(people) ||
            people <= 0
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Number of people must be a positive whole number"

            });

        }


        // ========================================================
        // FIND SHELTER
        // ========================================================

        const shelter =
            await Shelter.findById(
                shelterId
            );


        if (!shelter) {

            return res.status(404).json({

                success: false,

                message:
                    "Shelter not found"

            });

        }


        // ========================================================
        // CHECK SHELTER STATUS
        // ========================================================

        if (
            shelter.status === "closed"
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "This shelter is closed"

            });

        }


        // ========================================================
        // CHECK AVAILABLE CAPACITY
        // ========================================================

        if (
            people >
            shelter.availableCapacity
        ) {

            return res.status(400).json({

                success: false,

                message:
                    `Only ${shelter.availableCapacity} beds are available in this shelter`

            });

        }


        // ========================================================
        // REDUCE AVAILABLE CAPACITY
        // ========================================================

        shelter.availableCapacity =
            shelter.availableCapacity -
            people;


        // ========================================================
        // UPDATE STATUS
        // ========================================================

        if (
            shelter.availableCapacity === 0
        ) {

            shelter.status =
                "full";

        } else {

            shelter.status =
                "available";

        }


        // ========================================================
        // SAVE
        // ========================================================

        await shelter.save();


        // ========================================================
        // RESPONSE
        // ========================================================

        return res.json({

            success: true,

            message:
                `${people} people assigned successfully`,

            shelter: {

                _id:
                    shelter._id,

                name:
                    shelter.name,

                capacity:
                    shelter.capacity,

                availableCapacity:
                    shelter.availableCapacity,

                status:
                    shelter.status

            }

        });


    } catch (error) {

        console.error(
            "Shelter assignment error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Failed to assign people to shelter"

        });

    }

});


module.exports = router;