require("dotenv").config();

const mongoose = require("mongoose");
const Incident = require("../models/Incident");

const incidents = [
    {
        incidentId: "SOS-001",

        title: "Severe Flooding - Bhubaneswar",

        type: "Flood",

        priority: "CRITICAL",

        description:
            "Severe flooding reported with civilians requiring immediate evacuation.",

        lat: 20.2961,

        lng: 85.8245,

        people: 120,

        injured: 8,

        capabilities: [
            "Water Rescue",
            "Evacuation",
            "Medical"
        ],

        status: "ACTIVE"
    },

    {
        incidentId: "SOS-002",

        title: "Industrial Fire",

        type: "Fire",

        priority: "HIGH",

        description:
            "Industrial fire reported. Fire suppression and evacuation support required.",

        lat: 20.2900,

        lng: 85.8500,

        people: 45,

        injured: 3,

        capabilities: [
            "Fire Rescue",
            "Fire Suppression",
            "Medical",
            "Evacuation"
        ],

        status: "ACTIVE"
    },

    {
        incidentId: "SOS-003",

        title: "Road Blockage",

        type: "Landslide",

        priority: "MEDIUM",

        description:
            "Landslide has blocked a major road. Road clearance and evacuation support required.",

        lat: 20.3100,

        lng: 85.8100,

        people: 30,

        injured: 0,

        capabilities: [
            "Road Clearance",
            "Evacuation"
        ],

        status: "ACTIVE"
    }
];

async function seedDatabase() {

    try {

        await mongoose.connect(
            process.env.MONGO_URI
        );

        console.log("MongoDB connected.");

        await Incident.deleteMany({});

        await Incident.insertMany(
            incidents
        );

        console.log(
            "Incidents inserted successfully."
        );

        await mongoose.connection.close();

        console.log(
            "Database connection closed."
        );

    } catch (error) {

        console.error(
            "Seeding failed:"
        );

        console.error(
            error.message
        );

        process.exit(1);
    }
}

seedDatabase();