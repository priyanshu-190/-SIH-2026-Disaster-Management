require("dotenv").config();

const sendSMS = require("./services/smsService");

async function testSMS() {
    try {
        const result = await sendSMS(
            "+919161181421",
            
        );

        console.log("✅ SMS sent successfully!");
        console.log("Message SID:", result.sid);

    } catch (error) {
        console.error("❌ SMS failed:");
        console.error(error.message);
    }
}

testSMS();