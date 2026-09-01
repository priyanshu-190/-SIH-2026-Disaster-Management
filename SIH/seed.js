const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const Authority = require("./models/Authority");

const seedAdmin = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected for seeding");

        // Check if admin already exists
        const existingAdmin = await Authority.findOne({
            authorityId: "ADMIN001"
        });

        if (existingAdmin) {
            console.log("Admin already exists!");
            return;
        }

        // Password to be used for login
        const hashedPassword = await bcrypt.hash("Admin@123", 10);

        // Create admin
        const admin = await Authority.create({
            authorityId: "ADMIN001",
            password: hashedPassword,
            role: "admin"
        });

        console.log("Admin created successfully!");
        console.log("Authority ID:", admin.authorityId);
        console.log("Role:", admin.role);

    } catch (error) {
        console.error("Seeding error:", error.message);
    } finally {
        await mongoose.connection.close();
    }
};

seedAdmin();