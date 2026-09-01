require("dotenv").config();

const mongoose = require("mongoose");

const Incident = require("../models/Incident");
const Team = require("../models/Team");
const Mission = require("../models/Mission");


const incidents = [
    {
        incidentId: "DR-1042",
        type: "Flood",
        title: "Flood — Sector 3",
        priority: "CRITICAL",
        lat: 20.3050,
        lng: 85.8350,
        people: 25,
        trapped: true,
        children: 5,
        injured: 3,
        description:
            "Residents trapped inside a flooded residential building. Water level rising rapidly.",
        capabilities: [
            "Water Rescue",
            "Medical",
            "Evacuation"
        ],
        status: "ACTIVE"
    },

    {
        incidentId: "DR-1043",
        type: "Landslide",
        title: "Landslide — NH-16",
        priority: "HIGH",
        lat: 20.2800,
        lng: 85.8100,
        people: 8,
        trapped: false,
        children: 1,
        injured: 2,
        description:
            "Road partially blocked after landslide. Two injured persons reported.",
        capabilities: [
            "Medical",
            "Road Clearance"
        ],
        status: "ACTIVE"
    },

    {
        incidentId: "DR-1044",
        type: "Fire",
        title: "Building Fire — Unit 7",
        priority: "CRITICAL",
        lat: 20.2950,
        lng: 85.8500,
        people: 14,
        trapped: true,
        children: 2,
        injured: 1,
        description:
            "Smoke visible from a multi-storey building. Possible occupants trapped.",
        capabilities: [
            "Fire Rescue",
            "Medical",
            "Evacuation"
        ],
        status: "ACTIVE"
    }
];


const teams = [
    {
        teamId: "NDRF-07",
        name: "NDRF Alpha",
        organization: "NDRF",
        lat: 20.2805,
        lng: 85.8105,
        status: "AVAILABLE",
        load: 20,
        capabilities: [
            "Water Rescue",
            "Medical",
            "Evacuation"
        ]
    },

    {
        teamId: "SDRF-12",
        name: "SDRF Bravo",
        organization: "SDRF",
        lat: 20.3200,
        lng: 85.8250,
        status: "AVAILABLE",
        load: 10,
        capabilities: [
            "Water Rescue",
            "Evacuation",
            "Road Clearance"
        ]
    },

    {
        teamId: "FIRE-04",
        name: "Fire & Rescue Unit 04",
        organization: "FIRE",
        lat: 20.2900,
        lng: 85.8550,
        status: "AVAILABLE",
        load: 30,
        capabilities: [
            "Fire Rescue",
            "Fire Suppression",
            "Medical",
            "Evacuation"
        ]
    },

    {
        teamId: "AMB-21",
        name: "Ambulance Unit 21",
        organization: "AMBULANCE",
        lat: 20.3000,
        lng: 85.8450,
        status: "AVAILABLE",
        load: 15,
        capabilities: [
            "Medical",
            "Patient Transport"
        ]
    },

    {
        teamId: "POL-08",
        name: "Police Response Unit 08",
        organization: "POLICE",
        lat: 20.3100,
        lng: 85.8000,
        status: "BUSY",
        load: 60,
        capabilities: [
            "Evacuation",
            "Crowd Control",
            "Traffic Control",
            "Area Security"
        ]
    }
];


async function seedDatabase() {

    try {

        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected.");


        // Remove old test data
        await Mission.deleteMany({});
        await Incident.deleteMany({});
        await Team.deleteMany({});


        // Insert frontend data
        await Incident.insertMany(incidents);
        await Team.insertMany(teams);


        console.log("Frontend data seeded successfully.");

        console.log(`Incidents inserted: ${incidents.length}`);
        console.log(`Teams inserted: ${teams.length}`);


        await mongoose.connection.close();

        console.log("Database connection closed.");

    } catch (error) {

        console.error("Seeding failed:");
        console.error(error.message);

        process.exit(1);
    }
}


seedDatabase();