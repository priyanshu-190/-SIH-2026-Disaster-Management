const twilio = require("twilio");

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to) => {
    const result = await client.messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: to,
        body: "sms_internal_alerts"
    });

    return result;
};

module.exports = sendSMS;