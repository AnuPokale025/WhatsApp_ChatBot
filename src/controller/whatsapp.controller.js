const crypto = require("crypto");

const {
    processMessage,
} = require("../service/chatbot.service");


/**
 * Verify WhatsApp webhook
 */
const verifyWebhook = (req, res) => {

    const mode = req.query["hub.mode"];

    const token = req.query["hub.verify_token"];

    const challenge = req.query["hub.challenge"];


    if (
        mode === "subscribe" &&
        token === process.env.WHATSAPP_VERIFY_TOKEN
    ) {

        console.log("WhatsApp webhook verified");

        return res.status(200).send(challenge);
    }


    return res.sendStatus(403);
};


/**
 * Validate Meta webhook signature
 */
const validateSignature = (req) => {

    const signature =
        req.headers["x-hub-signature-256"];

    if (!signature) {
        return false;
    }


    const expectedSignature =
        "sha256=" +

        crypto
            .createHmac(
                "sha256",
                process.env.WHATSAPP_APP_SECRET
            )
            .update(req.rawBody)
            .digest("hex");


    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};


/**
 * Receive WhatsApp webhook
 */
const receiveWebhook = async (req, res) => {

    try {

        /**
         * Always respond quickly to Meta
         */
        res.sendStatus(200);


        /**
         * Validate signature
         */
        if (
            process.env.NODE_ENV === "production" &&
            !validateSignature(req)
        ) {

            console.error(
                "Invalid WhatsApp webhook signature"
            );

            return;
        }


        const body = req.body;


        console.log(
            "WhatsApp Webhook:",
            JSON.stringify(body, null, 2)
        );


        if (
            body.object !== "whatsapp_business_account"
        ) {
            return;
        }


        const entries = body.entry || [];


        for (const entry of entries) {

            const changes = entry.changes || [];


            for (const change of changes) {

                const value = change.value;


                if (!value || !value.messages) {
                    continue;
                }


                const contacts =
                    value.contacts || [];


                const messages =
                    value.messages || [];


                for (const message of messages) {

                    if (message.type !== "text" &&
                        message.type !== "interactive") {

                        continue;
                    }


                    const phone =
                        message.from;


                    const contact =
                        contacts.find(
                            (c) => c.wa_id === phone
                        );


                    const name =
                        contact?.profile?.name || "";


                    let text = "";

                    let buttonId = null;


                    /**
                     * Text message
                     */
                    if (message.type === "text") {

                        text =
                            message.text?.body || "";
                    }


                    /**
                     * Interactive button/list
                     */
                    if (
                        message.type === "interactive"
                    ) {

                        if (
                            message.interactive
                                ?.type === "button_reply"
                        ) {

                            buttonId =
                                message
                                    .interactive
                                    .button_reply
                                    .id;

                            text =
                                message
                                    .interactive
                                    .button_reply
                                    .title;
                        }


                        if (
                            message.interactive
                                ?.type === "list_reply"
                        ) {

                            buttonId =
                                message
                                    .interactive
                                    .list_reply
                                    .id;

                            text =
                                message
                                    .interactive
                                    .list_reply
                                    .title;
                        }
                    }


                    /**
                     * Process chatbot
                     */
                    try {

                        await processMessage({
                            phone,
                            name,
                            text,
                            buttonId,
                        });

                    } catch (error) {

                        console.error(
                            "Chatbot processing error:",
                            error
                        );
                    }
                }
            }
        }

    } catch (error) {

        console.error(
            "Webhook error:",
            error
        );
    }
};


module.exports = {
    verifyWebhook,
    receiveWebhook,
};