const express = require("express");
const axios = require("axios");

const router = express.Router();


// ==========================================
// GET - META WEBHOOK VERIFICATION
// ==========================================

router.get("/webhook", (req, res) => {

    const verifyToken =
        process.env.WHATSAPP_VERIFY_TOKEN;

    const mode =
        req.query["hub.mode"];

    const token =
        req.query["hub.verify_token"];

    const challenge =
        req.query["hub.challenge"];

    console.log("========== WEBHOOK VERIFICATION ==========");
    console.log("Mode:", mode);
    console.log("Token:", token);
    console.log("Challenge:", challenge);

    if (
        mode === "subscribe" &&
        token === verifyToken
    ) {

        console.log("WEBHOOK VERIFIED");

        return res
            .status(200)
            .send(challenge);
    }

    console.log("WEBHOOK VERIFICATION FAILED");

    return res.sendStatus(403);
});


// ==========================================
// POST - RECEIVE WHATSAPP MESSAGE
// ==========================================

router.post("/webhook", async (req, res) => {

    try {

        console.log("========== WHATSAPP MESSAGE ==========");

        console.log(
            JSON.stringify(req.body, null, 2)
        );

        const messages = [];

        for (const entry of req.body.entry || []) {
            for (const change of entry.changes || []) {
                for (const message of change.value?.messages || []) {
                    messages.push(message);
                }
            }
        }

        if (messages.length === 0) {
            console.log(
                "Webhook received without inbound messages; this is usually a status notification."
            );

            return res.sendStatus(200);
        }


        // ==================================
        // SEND A REPLY FOR EACH NEW MESSAGE
        // ==================================

        const apiVersion =
            process.env.WHATSAPP_API_VERSION || "v24.0";

        const url =
            `https://graph.facebook.com/${apiVersion}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

        for (const message of messages) {
            const from = message.from;
            const text = message.text?.body || "";

            if (!from) {
                console.log("Skipping WhatsApp message without sender number");
                continue;
            }

            console.log("FROM:", from);
            console.log("MESSAGE:", text);

            const reply =
                "Welcome to Elite Loan 👋\n\n" +
                "How can I help you?\n\n" +
                "1️⃣ Apply for a Loan\n" +
                "2️⃣ Check Loan Status\n" +
                "3️⃣ Loan Eligibility\n" +
                "4️⃣ Talk to Support";

            await axios.post(
                url,
                {
                    messaging_product: "whatsapp",
                    to: from,
                    type: "text",
                    text: {
                        body: reply
                    }
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
                        "Content-Type":
                            "application/json"
                    }
                }
            );

            console.log("BOT REPLY SENT");
        }

        return res.sendStatus(200);

    } catch (error) {

        console.error(
            "WhatsApp Error:"
        );

        console.error(
            error.response?.data ||
            error.message
        );

        return res.sendStatus(500);
    }

});


module.exports = router;