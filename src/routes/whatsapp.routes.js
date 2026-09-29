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

        const message =
            req.body.entry?.[0]
                ?.changes?.[0]
                ?.value?.messages?.[0];

        if (!message) {

            console.log(
                "No WhatsApp message found"
            );

            return res.sendStatus(200);
        }


        // Sender WhatsApp number
        const from = message.from;

        // Message text
        const text =
            message.text?.body || "";

        console.log("FROM:", from);
        console.log("MESSAGE:", text);


        // ==================================
        // CHATBOT RESPONSE
        // ==================================

        let reply =
            "Welcome to Elite Loan 👋\n\n" +
            "How can I help you?\n\n" +
            "1️⃣ Apply for a Loan\n" +
            "2️⃣ Check Loan Status\n" +
            "3️⃣ Loan Eligibility\n" +
            "4️⃣ Talk to Support";


        if (
            text.toLowerCase().trim() === "hi" ||
            text.toLowerCase().trim() === "hello"
        ) {

            reply =
                "Welcome to Elite Loan 👋\n\n" +
                "How can I help you?\n\n" +
                "1️⃣ Apply for a Loan\n" +
                "2️⃣ Check Loan Status\n" +
                "3️⃣ Loan Eligibility\n" +
                "4️⃣ Talk to Support";
        }


        // ==================================
        // SEND MESSAGE TO WHATSAPP
        // ==================================

        const url =
            `https://graph.facebook.com/vXX.X/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

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


        console.log(
            "BOT REPLY SENT"
        );

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