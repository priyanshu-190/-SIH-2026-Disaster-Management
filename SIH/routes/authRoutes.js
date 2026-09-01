const express = require("express");

const router = express.Router();

const { login } = require("../controllers/authController");


// LOGIN
router.post("/login", login);


// LOGOUT
router.post("/logout", (req, res) => {

    res.clearCookie("token", {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    });

    return res.json({
        message: "Logout successful"
    });

});


module.exports = router;
