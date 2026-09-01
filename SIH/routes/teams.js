const express = require("express");
const Team = require("../models/Team");

const router = express.Router();


// GET ALL TEAMS
router.get("/", async (req, res) => {
    try {
        const teams = await Team.find()
            .sort({ createdAt: -1 });

        res.json(teams);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch teams"
        });
    }
});


// GET ONE TEAM
router.get("/:id", async (req, res) => {
    try {
        const team = await Team.findOne({
            teamId: req.params.id
        });

        if (!team) {
            return res.status(404).json({
                message: "Team not found"
            });
        }

        res.json(team);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Failed to fetch team"
        });
    }
});


module.exports = router;