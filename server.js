require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const whatsappRoutes =
    require("./src/routes/whatsapp.routes");


const app = express();


/**
 * CORS
 */
app.use(
    cors({
        origin: "*",
    })
);


/**
 * Capture raw body for Meta signature validation
 */
app.use(
    express.json({
        verify: (req, res, buf) => {
            req.rawBody = buf;
        },
    })
);


app.use(
    express.urlencoded({
        extended: true,
    })
);


/**
 * Database
 */
connectDB();


/**
 * Routes
 */
app.use(
    "/api/whatsapp",
    whatsappRoutes
);


/**
 * Health check
 */
app.get(
    "/",
    (req, res) => {

        res.json({
            success: true,
            message: "WhatsApp chatbot server is running",
        });

    }
);


/**
 * Start server
 */
const PORT =
    process.env.PORT || 3000;


app.listen(
    PORT,
    () => {

        console.log(
            `Server running on port ${PORT}`
        );

    }
);