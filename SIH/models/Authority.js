const mongoose = require("mongoose");

const authoritySchema = new mongoose.Schema(
    {
      

        authorityId: {
            type: String,
            required: true,
            unique: true
        },

      

        password: {
            type: String,
            required: true
        },

        role: {
            type: String,
            enum: ["Rescue Team", "authority"],
            default: "authority"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Authority", authoritySchema);