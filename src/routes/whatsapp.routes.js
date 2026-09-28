const express = require("express");

const {
    verifyWebhook,
    receiveWebhook,
} = require("../controller/whatsapp.controller");

const router = express.Router();


/**
 * Meta webhook verification
 */
router.get(
    "/webhook",
    verifyWebhook
);


/**
 * Receive WhatsApp messages
 */
router.post(
    "/webhook",
    receiveWebhook
);


module.exports = router;