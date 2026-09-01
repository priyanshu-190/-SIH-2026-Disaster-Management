const mongoose = require("mongoose");
const dotenv = require("dotenv");

const Team = require("./models/Team");

dotenv.config();

const teams = [

    // =====================================================
    // NDRF
    // =====================================================

    {
        teamId: "NDRF-01",
        name: "NDRF Rescue Team 01",
        organization: "NDRF",

        lat: 20.3050,
        lng: 85.8150,

        status: "AVAILABLE",
        load: 20,

        capabilities: [
            "FLOOD",
            "EARTHQUAKE",
            "RESCUE",
            "EVACUATION",
            "WATER_RESCUE"
        ]
    },


    {
        teamId: "NDRF-02",
        name: "NDRF Rescue Team 02",
        organization: "NDRF",

        lat: 20.3200,
        lng: 85.8050,

        status: "AVAILABLE",
        load: 10,

        capabilities: [
            "FLOOD",
            "EARTHQUAKE",
            "RESCUE",
            "EVACUATION"
        ]
    },


    // =====================================================
    // SDRF
    // =====================================================

    {
        teamId: "SDRF-01",
        name: "SDRF Rescue Team 01",
        organization: "SDRF",

        lat: 20.2961,
        lng: 85.8245,

        status: "AVAILABLE",
        load: 15,

        capabilities: [
            "FLOOD",
            "RESCUE",
            "EVACUATION",
            "WATER_RESCUE"
        ]
    },


    {
        teamId: "SDRF-02",
        name: "SDRF Rescue Team 02",
        organization: "SDRF",

        lat: 20.2850,
        lng: 85.8350,

        status: "AVAILABLE",
        load: 25,

        capabilities: [
            "FLOOD",
            "EARTHQUAKE",
            "RESCUE",
            "EVACUATION"
        ]
    },


    // =====================================================
    // FIRE & RESCUE
    // =====================================================

    {
        teamId: "FIRE-01",
        name: "Fire & Emergency Team 01",
        organization: "FIRE",

        lat: 20.3000,
        lng: 85.8200,

        status: "AVAILABLE",
        load: 20,

        capabilities: [
            "FIRE",
            "RESCUE",
            "BUILDING_COLLAPSE",
            "HAZMAT"
        ]
    },


    {
        teamId: "FIRE-02",
        name: "Fire & Emergency Team 02",
        organization: "FIRE",

        lat: 20.3150,
        lng: 85.8350,

        status: "AVAILABLE",
        load: 30,

        capabilities: [
            "FIRE",
            "RESCUE",
            "BUILDING_COLLAPSE"
        ]
    },


    // =====================================================
    // AMBULANCE
    // =====================================================

    {
        teamId: "AMB-01",
        name: "Emergency Ambulance Team 01",
        organization: "AMBULANCE",

        lat: 20.3100,
        lng: 85.8300,

        status: "AVAILABLE",
        load: 15,

        capabilities: [
            "MEDICAL",
            "INJURY",
            "PATIENT_TRANSPORT",
            "EMERGENCY_MEDICAL"
        ]
    },


    {
        teamId: "AMB-02",
        name: "Emergency Ambulance Team 02",
        organization: "AMBULANCE",

        lat: 20.2900,
        lng: 85.8400,

        status: "AVAILABLE",
        load: 10,

        capabilities: [
            "MEDICAL",
            "INJURY",
            "PATIENT_TRANSPORT"
        ]
    },


    // =====================================================
    // POLICE / 112
    // =====================================================

    {
        teamId: "POLICE-112",
        name: "Police Emergency Team 01",
        organization: "POLICE",

        lat: 20.2900,
        lng: 85.8100,

        status: "AVAILABLE",
        load: 20,

        capabilities: [
            "SECURITY",
            "TRAFFIC_CONTROL",
            "EVACUATION",
            "CROWD_CONTROL"
        ]
    },


    {
        teamId: "POLICE-113",
        name: "Police Emergency Team 02",
        organization: "POLICE",

        lat: 20.3250,
        lng: 85.8250,

        status: "AVAILABLE",
        load: 15,

        capabilities: [
            "SECURITY",
            "TRAFFIC_CONTROL",
            "CROWD_CONTROL"
        ]
    }

];


// =========================================================
// SEED TEAMS
// =========================================================

async function seedTeams() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log(
            "MongoDB connected"
        );


        // Remove old Team documents

        await Team.deleteMany({});

        console.log(
            "Old teams removed"
        );


        // Insert new teams

        await Team.insertMany(
            teams
        );


        console.log(
            "================================="
        );

        console.log(
            "Relief teams seeded successfully!"
        );

        console.log(
            "================================="
        );


        teams.forEach(
            team => {

                console.log(
                    `${team.organization.padEnd(10)} → ${team.teamId}`
                );

            }
        );


        console.log(
            "================================="
        );

        console.log(
            `Total teams: ${teams.length}`
        );

        console.log(
            "================================="
        );


        process.exit(0);

    } catch (error) {

        console.error(
            "Seed error:",
            error
        );

        process.exit(1);

    }

}


seedTeams();