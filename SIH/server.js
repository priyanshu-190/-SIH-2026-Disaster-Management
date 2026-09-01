// =========================================================
// SERVER.JS
// =========================================================

const dns = require("node:dns/promises");

// Use Cloudflare DNS for MongoDB Atlas resolution
dns.setServers(["1.1.1.1"]);


// =========================================================
// IMPORTS
// =========================================================

const http = require("http");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

const { Server } = require("socket.io");


// =========================================================
// ENVIRONMENT
// =========================================================

dotenv.config();


// =========================================================
// DATABASE
// =========================================================

const connectDB = require("./config/db");


// =========================================================
// ROUTES
// =========================================================

const citizenRoutes =
    require("./routes/citizenRoutes");

const reportRoutes =
    require("./routes/reportRoutes");
const incidentRoutes = require("./routes/incidents");
const shelterRoutes =
    require("./routes/shelterRoutes");

const alertRoutes =
    require("./routes/alertRoutes");

const authRoutes =
    require("./routes/authRoutes");

const missionRoutes =
    require("./routes/missions");

const teamRoutes =
    require("./routes/teams");

const Communication =
    require("./models/Communication");
// =========================================================
// AUTH MIDDLEWARE
// =========================================================

const authMiddleware =
    require("./middleware/authMiddleware");


// =========================================================
// CONNECT DATABASE
// =========================================================

connectDB();


// =========================================================
// EXPRESS APP
// =========================================================

const app =
    express();


// =========================================================
// HTTP SERVER
// =========================================================

const server =
    http.createServer(app);


// =========================================================
// SOCKET.IO
// =========================================================

const io =
    new Server(server, {

        cors: {

            origin: "*",

            methods: [
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE"
            ]

        }

    });


// =========================================================
// MAKE SOCKET.IO AVAILABLE TO ROUTES
// =========================================================

app.set(
    "io",
    io
);


// =========================================================
// VIEW ENGINE
// =========================================================

app.set(
    "view engine",
    "ejs"
);


app.set(
    "views",
    path.join(
        __dirname,
        "views"
    )
);


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    cookieParser()
);


// =========================================================
// STATIC FILES
// =========================================================

app.use(
    express.static(
        path.join(
            __dirname,
            "public"
        )
    )
);


// =========================================================
// API ROUTES
// =========================================================


// Authentication
app.use(
    "/api/auth",
    authRoutes
);


// Citizen
app.use(
    "/citizen",
    citizenRoutes
);


// Reports
app.use(
    "/api/reports",
    reportRoutes
);


// Shelters
app.use(
    "/api/shelters",
    shelterRoutes
);
app.use("/api/incidents", incidentRoutes);

// Alerts
app.use(
    "/api/alerts",
    alertRoutes
);


// Missions
app.use(
    "/api/missions",
    missionRoutes
);


// Teams
app.use(
    "/api/teams",
    teamRoutes
);


// =========================================================
// PAGE ROUTES
// =========================================================


// ---------------------------------------------------------
// CITIZEN PAGE
// ---------------------------------------------------------

app.get(
    "/",
    (req, res) => {

        res.render(
            "citizen"
        );

    }
);


// ---------------------------------------------------------
// CITIZEN PAGE
// ---------------------------------------------------------

app.get(
    "/citizen",
    (req, res) => {

        res.render(
            "citizen"
        );

    }
);


// ---------------------------------------------------------
// LOGIN PAGE
// ---------------------------------------------------------

app.get(
    "/login",
    (req, res) => {

        res.render(
            "login"
        );

    }
);


// ---------------------------------------------------------
// AUTHORITY DASHBOARD
// ---------------------------------------------------------

app.get(
    "/dashboard",
    authMiddleware,
    (req, res) => {

        res.render(
            "dashboard"
        );

    }
);
// ---------------------------------------------------------
// PAST INCIDENTS
// ---------------------------------------------------------

app.get(
    "/past-incidents",
    authMiddleware,
    (req, res) => {

        res.render(
            "past_incidents"
        );

    }
);

// ---------------------------------------------------------
// DISASTER RELIEF HUB
// ---------------------------------------------------------

app.get(
    "/disaster-relief",
    authMiddleware,
    (req, res) => {

        res.render(
            "disaster_relief_hub"
        );

    }
);


// =========================================================
// HEALTH CHECK
// =========================================================

app.get(
    "/api/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "Disaster Relief Platform is running",

            socket:
                "connected",

            timestamp:
                new Date().toISOString()

        });

    }
);


// =========================================================
// SOCKET.IO
// =========================================================

io.on(
    "connection",
    (socket) => {

        console.log(
            "🟢 Socket connected:",
            socket.id
        );


        // =====================================================
        // JOIN RELIEF TEAM ROOM
        // =====================================================

        socket.on(
            "joinTeamRoom",
            (teamId) => {

                if (!teamId) {

                    console.log(
                        "⚠️ Team room join attempted without team ID"
                    );

                    return;

                }


                const room =
                    `team:${teamId}`;


                // Leave any previous team rooms
                for (
                    const joinedRoom
                    of socket.rooms
                ) {

                    if (
                        joinedRoom !==
                        socket.id
                    ) {

                        socket.leave(
                            joinedRoom
                        );

                    }

                }


                // Join current team's room
                socket.join(
                    room
                );


                console.log(
                    `🚑 ${socket.id} joined ${room}`
                );


                // Tell frontend that joining succeeded
                socket.emit(
                    "teamRoomJoined",
                    {

                        teamId:
                            teamId,

                        room:
                            room

                    }
                );

            }
        );


        // =====================================================
        // LEAVE TEAM ROOM
        // =====================================================

        socket.on(
            "leaveTeamRoom",
            (teamId) => {

                if (!teamId) {
                    return;
                }


                const room =
                    `team:${teamId}`;


                socket.leave(
                    room
                );


                console.log(
                    `🚪 ${socket.id} left ${room}`
                );

            }
        );


        // =====================================================
        // DISCONNECT
        // =====================================================
// =====================================================
// TEAM CHAT MESSAGE
// =====================================================
// =====================================================
// TEAM → AUTHORITY COMMUNICATION
// =====================================================
// =========================================================
// AUTHORITY → RESCUE TEAM MESSAGE
// =========================================================

socket.on(
    "authorityMessage",
    (data) => {

        if (!data) {
            return;
        }

        const teamId =
            String(data.teamId || "").trim();

        const message =
            String(data.message || "").trim();

        if (!teamId || !message) {
            return;
        }

        const messageData = {

            teamId,

            incidentId:
                data.incidentId || null,

            missionId:
                data.missionId || null,

            message,

            senderType:
                "authority",

            sender:
                "Authority",

            type:
                data.type || "INSTRUCTION",

            priority:
                data.priority || "NORMAL",

            timestamp:
                new Date().toISOString()

        };


        // Send ONLY to the selected rescue team
        io.to(
            `team:${teamId}`
        ).emit(
            "authorityMessage",
            messageData
        );


        console.log(
            `📢 Authority → ${teamId}: ${message}`
        );

    }
);
socket.on(
    "teamMessage",
    async (data) => {

        try {

            if (!data) {
                return;
            }

            const teamId =
                String(
                    data.teamId || ""
                ).trim();

            const message =
                String(
                    data.message || ""
                ).trim();

            const incidentId =
                data.incidentId
                    ? String(
                        data.incidentId
                    ).trim()
                    : null;

            const missionId =
                data.missionId
                    ? String(
                        data.missionId
                    ).trim()
                    : null;

            const type =
                data.type ||
                "GENERAL";

            const priority =
                data.priority ||
                "NORMAL";


            if (
                !teamId ||
                !message ||
                !incidentId
            ) {

                console.log(
                    "⚠️ Invalid team communication:",
                    data
                );

                return;

            }

// =====================================================
// AUTHORITY → TEAM COMMUNICATION
// =====================================================

socket.on(
    "authorityMessage",
    async (data) => {

        try {

            if (!data) {
                return;
            }


            const teamId =
                String(
                    data.teamId || ""
                ).trim();

            const message =
                String(
                    data.message || ""
                ).trim();

            const incidentId =
                data.incidentId
                    ? String(
                        data.incidentId
                    ).trim()
                    : null;

            const missionId =
                data.missionId
                    ? String(
                        data.missionId
                    ).trim()
                    : null;

            const type =
                data.type ||
                "INSTRUCTION";

            const priority =
                data.priority ||
                "NORMAL";


            if (
                !teamId ||
                !message ||
                !incidentId
            ) {

                console.log(
                    "⚠️ Invalid authority communication:",
                    data
                );

                return;

            }


            // =================================================
            // SAVE TO MONGODB
            // =================================================

            const communication =
                await Communication.create({

                    incidentId,

                    missionId,

                    teamId,

                    senderType:
                        "AUTHORITY",

                    sender:
                        "Authority",

                    message,

                    type,

                    priority,

                    readByAuthority:
                        true,

                    readByTeam:
                        false

                });


            // =================================================
            // SEND TO SPECIFIC RESCUE TEAM
            // =================================================

            const messageData = {

                _id:
                    communication._id,

                incidentId,

                missionId,

                teamId,

                message,

                senderType:
                    "authority",

                sender:
                    "Authority",

                type,

                priority,

                timestamp:
                    communication.createdAt

            };


            io.to(
                `team:${teamId}`
            ).emit(
                "teamMessage",
                messageData
            );


            console.log(
                `🏛️ AUTHORITY → ${teamId}: ${message}`
            );


        } catch (error) {

            console.error(
                "❌ Authority communication error:",
                error
            );

        }

    }
);
            // =============================================
            // SAVE MESSAGE TO MONGODB
            // =============================================

            const communication =
                await Communication.create({

                    incidentId,

                    missionId,

                    teamId,

                    senderType:
                        "TEAM",

                    sender:
                        teamId,

                    message,

                    type,

                    priority,

                    readByAuthority:
                        false,

                    readByTeam:
                        true

                });


            // =============================================
            // REAL-TIME MESSAGE DATA
            // =============================================

            const messageData = {

                _id:
                    communication._id,

                incidentId,

                missionId,

                teamId,

                message,

                senderType:
                    "team",

                sender:
                    teamId,

                type,

                priority,

                timestamp:
                    communication.createdAt

            };


            // =============================================
            // SEND TO TEAM ROOM
            // =============================================

            io.to(
                `team:${teamId}`
            ).emit(
                "teamMessage",
                messageData
            );


            // =============================================
            // SEND TO AUTHORITY
            // =============================================

            io.emit(
                "teamMessage",
                messageData
            );


            console.log(
                `💬 ${teamId} → AUTHORITY: ${message}`
            );


        } catch (error) {

            console.error(
                "❌ Team communication error:",
                error
            );

        }

    }
);
    }
);


// =========================================================
// 404 HANDLER
// =========================================================

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            message:
                "Route not found",

            path:
                req.originalUrl

        });

    }
);


// =========================================================
// ERROR HANDLER
// =========================================================

app.use(
    (err, req, res, next) => {

        console.error(
            "❌ Server error:",
            err
        );


        res.status(
            err.status || 500
        ).json({

            success: false,

            message:
                err.message ||
                "Internal server error"

        });

    }
);


// =========================================================
// START SERVER
// =========================================================

const PORT =
    process.env.PORT || 5000;


server.listen(
    PORT,
    () => {

        console.log(
            "========================================"
        );

        console.log(
            "🚨 DISASTER RELIEF PLATFORM"
        );

        console.log(
            "========================================"
        );

        console.log(
            `🚀 Server running on port ${PORT}`
        );

        console.log(
            `🌐 http://localhost:${PORT}`
        );

        console.log(
            "🔌 Socket.IO enabled"
        );

        console.log(
            "🚑 Team rooms enabled"
        );

        console.log(
            "========================================"
        );

    }
);