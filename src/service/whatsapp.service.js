const axios = require("axios");

const API_VERSION = process.env.WHATSAPP_API_VERSION || "v24.0";

const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;

const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

const WHATSAPP_URL =
    `https://graph.facebook.com/${API_VERSION}/${PHONE_NUMBER_ID}/messages`;


/**
 * Send normal text message
 */
const sendTextMessage = async (to, message) => {
    try {
        const response = await axios.post(
            WHATSAPP_URL,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,
                type: "text",
                text: {
                    preview_url: false,
                    body: message,
                },
            },
            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log("WhatsApp message sent:", response.data);

        return response.data;

    } catch (error) {

        console.error(
            "WhatsApp send error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


/**
 * Send interactive button message
 */
const sendButtonMessage = async (
    to,
    body,
    buttons
) => {

    try {

        const response = await axios.post(
            WHATSAPP_URL,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,

                type: "interactive",

                interactive: {
                    type: "button",

                    body: {
                        text: body,
                    },

                    action: {
                        buttons: buttons.map((button) => ({
                            type: "reply",

                            reply: {
                                id: button.id,
                                title: button.title,
                            },
                        })),
                    },
                },
            },

            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "Button message error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


/**
 * Send interactive list
 */
const sendListMessage = async (
    to,
    body,
    buttonText,
    sections
) => {

    try {

        const response = await axios.post(
            WHATSAPP_URL,
            {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: to,

                type: "interactive",

                interactive: {
                    type: "list",

                    body: {
                        text: body,
                    },

                    action: {
                        button: buttonText,

                        sections: sections,
                    },
                },
            },

            {
                headers: {
                    Authorization: `Bearer ${ACCESS_TOKEN}`,
                    "Content-Type": "application/json",
                },
            }
        );

        return response.data;

    } catch (error) {

        console.error(
            "List message error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


module.exports = {
    sendTextMessage,
    sendButtonMessage,
    sendListMessage,
};