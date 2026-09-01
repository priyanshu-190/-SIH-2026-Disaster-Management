const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Authority = require("../models/Authority");
const RescueTeam = require("../models/RescueTeam");

const login = async (req, res) => {
    try {
        const { role, authorityId, password } = req.body;

        // Check required fields
        if (!role || !authorityId || !password) {
            return res.status(400).json({
                message: "Role, Login ID and password are required"
            });
        }

        // ========================================
        // AUTHORITY LOGIN
        // ========================================

        if (role === "authority") {

            const authority = await Authority.findOne({
                authorityId: authorityId
            });

            if (!authority) {
                return res.status(401).json({
                    message: "Invalid Authority ID or Password"
                });
            }

            const isPasswordCorrect = await bcrypt.compare(
                password,
                authority.password
            );

            if (!isPasswordCorrect) {
                return res.status(401).json({
                    message: "Invalid Authority ID or Password"
                });
            }

            const token = jwt.sign(
                {
                    id: authority._id,
                    authorityId: authority.authorityId,
                    role: "authority"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.json({
                message: "Authority login successful",
                role: "authority"
            });
        }


        // ========================================
        // RELIEF TEAM LOGIN
        // ========================================

        if (role === "relief-team") {

            const rescueTeam = await RescueTeam.findOne({
                teamId: authorityId
            });

            if (!rescueTeam) {
                return res.status(401).json({
                    message: "Invalid Relief Team ID or Password"
                });
            }

            const isPasswordCorrect = await bcrypt.compare(
                password,
                rescueTeam.password
            );

            if (!isPasswordCorrect) {
                return res.status(401).json({
                    message: "Invalid Relief Team ID or Password"
                });
            }

            const token = jwt.sign(
                {
                    id: rescueTeam._id,
                    teamId: rescueTeam.teamId,
                    role: "relief-team"
                },
                process.env.JWT_SECRET,
                {
                    expiresIn: "1d"
                }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: false,
                sameSite: "lax",
                maxAge: 24 * 60 * 60 * 1000
            });

            return res.json({
                message: "Relief Team login successful",
                role: "relief-team"
            });
        }


        // ========================================
        // INVALID ROLE
        // ========================================

        return res.status(400).json({
            message: "Invalid user role"
        });

    } catch (error) {

        console.error("Login error:", error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

module.exports = {
    login
};