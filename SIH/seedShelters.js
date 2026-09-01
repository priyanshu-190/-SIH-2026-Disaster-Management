const mongoose = require("mongoose");
require("dotenv").config();

const Shelter = require("./models/Shelter");

const seedShelters = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected for shelter seeding");

        const shelters = [
            {
                name: "Rourkela Community Hall",
                address: "Civil Township, Rourkela",
                location: {
                    latitude: 22.2457,
                    longitude: 84.8611
                },
                capacity: 150,
                availableCapacity: 150,
                status: "available"
            },

            {
                name: "Birmitrapur Relief Center",
                address: "Birmitrapur",
                location: {
                    latitude: 22.4418,
                    longitude: 84.7646
                },
                capacity: 120,
                availableCapacity: 120,
                status: "available"
            },

            {
                name: "Rajgangpur Community Shelter",
                address: "Rajgangpur",
                location: {
                    latitude: 22.1988,
                    longitude: 84.5826
                },
                capacity: 100,
                availableCapacity: 100,
                status: "available"
            },

            {
                name: "Sundargarh Government School",
                address: "Sundargarh",
                location: {
                    latitude: 22.1167,
                    longitude: 84.0333
                },
                capacity: 180,
                availableCapacity: 180,
                status: "available"
            },

            {
                name: "Bonai Relief Center",
                address: "Bonai",
                location: {
                    latitude: 21.6467,
                    longitude: 85.0033
                },
                capacity: 100,
                availableCapacity: 100,
                status: "available"
            },

            {
                name: "Birsa Munda Community Hall",
                address: "Koira",
                location: {
                    latitude: 21.6278,
                    longitude: 85.1928
                },
                capacity: 120,
                availableCapacity: 120,
                status: "available"
            },

            {
                name: "Lathikata Relief Shelter",
                address: "Lathikata",
                location: {
                    latitude: 22.2500,
                    longitude: 84.8500
                },
                capacity: 100,
                availableCapacity: 100,
                status: "available"
            }
        ];

        await Shelter.deleteMany({});

        const result = await Shelter.insertMany(shelters);

        console.log("✅ Shelters seeded successfully!");
        console.log("Shelters inserted:", result.length);

    } catch (error) {
        console.error("❌ Shelter seeding error:", error.message);
    } finally {
        await mongoose.connection.close();
    }
};

seedShelters();