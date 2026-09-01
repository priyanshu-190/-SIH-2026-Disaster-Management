const mongoose = require("mongoose");
const shelterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    location: {
        latitude: {
            type: Number,
            required: true
        },
        longitude: {
            type: Number,
            required: true
        }
    },

    capacity: {
        type: Number,
        required: true
    },

    availableCapacity: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ["available", "full", "closed"],
        default: "available"
    },

    address: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Shelter", shelterSchema);