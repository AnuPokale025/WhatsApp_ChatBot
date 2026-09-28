const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        whatsappNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },

        name: {
            type: String,
            default: "",
        },

        loanType: {
            type: String,
            default: "",
        },

        loanAmount: {
            type: Number,
            default: null,
        },

        state: {
            type: String,
            default: "START",
        },

        lastMessage: {
            type: String,
            default: "",
        },

        lastMessageAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Customer", customerSchema);