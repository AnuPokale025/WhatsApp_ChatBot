const Customer = require("../model/Customer.js");

const {
    sendTextMessage,
    sendButtonMessage,
    sendListMessage,
} = require("../service/whatsapp.service.js");


/**
 * Get or create customer
 */
const getCustomer = async (phone, name = "") => {

    let customer = await Customer.findOne({
        whatsappNumber: phone,
    });

    if (!customer) {

        customer = await Customer.create({
            whatsappNumber: phone,
            name: name,
            state: "START",
        });

    } else if (name && !customer.name) {

        customer.name = name;

        await customer.save();
    }

    return customer;
};


/**
 * Main chatbot
 */
const processMessage = async ({
    phone,
    name,
    text,
    buttonId,
}) => {

    const customer = await getCustomer(phone, name);

    const message =
        (text || "").trim().toLowerCase();


    customer.lastMessage = text || buttonId || "";
    customer.lastMessageAt = new Date();

    await customer.save();


    /**
     * START
     */
    if (
        message === "hi" ||
        message === "hello" ||
        message === "hey" ||
        buttonId === "MAIN_MENU"
    ) {

        customer.state = "MAIN_MENU";

        await customer.save();

        await sendButtonMessage(
            phone,

            `Hello ${customer.name || "there"} 👋

Welcome to Elite Loan Associates.

How can we help you today?`,

            [
                {
                    id: "APPLY_LOAN",
                    title: "Apply Loan",
                },

                {
                    id: "LOAN_INFO",
                    title: "Loan Info",
                },

                {
                    id: "SUPPORT",
                    title: "Support",
                },
            ]
        );

        return;
    }


    /**
     * APPLY LOAN
     */
    if (buttonId === "APPLY_LOAN") {

        customer.state = "SELECT_LOAN";

        await customer.save();

        await sendListMessage(
            phone,

            "Please select the type of loan you need.",

            "Select Loan",

            [
                {
                    title: "Loan Types",

                    rows: [
                        {
                            id: "PERSONAL_LOAN",
                            title: "Personal Loan",
                            description: "For personal financial needs",
                        },

                        {
                            id: "BUSINESS_LOAN",
                            title: "Business Loan",
                            description: "For business requirements",
                        },

                        {
                            id: "HOME_LOAN",
                            title: "Home Loan",
                            description: "For home purchase or construction",
                        },
                    ],
                },
            ]
        );

        return;
    }


    /**
     * PERSONAL LOAN
     */
    if (buttonId === "PERSONAL_LOAN") {

        customer.loanType = "Personal Loan";
        customer.state = "ASK_AMOUNT";

        await customer.save();

        await sendTextMessage(
            phone,

            `Great! You selected Personal Loan.

Please enter the loan amount you require.

Example:
250000`
        );

        return;
    }


    /**
     * BUSINESS LOAN
     */
    if (buttonId === "BUSINESS_LOAN") {

        customer.loanType = "Business Loan";
        customer.state = "ASK_AMOUNT";

        await customer.save();

        await sendTextMessage(
            phone,

            `You selected Business Loan.

Please enter the loan amount you require.

Example:
500000`
        );

        return;
    }


    /**
     * HOME LOAN
     */
    if (buttonId === "HOME_LOAN") {

        customer.loanType = "Home Loan";
        customer.state = "ASK_AMOUNT";

        await customer.save();

        await sendTextMessage(
            phone,

            `You selected Home Loan.

Please enter the loan amount you require.

Example:
2500000`
        );

        return;
    }


    /**
     * LOAN AMOUNT
     */
    if (customer.state === "ASK_AMOUNT") {

        const amount = Number(
            message.replace(/[^0-9]/g, "")
        );

        if (!amount || amount <= 0) {

            await sendTextMessage(
                phone,

                "Please enter a valid loan amount.\n\nExample: 250000"
            );

            return;
        }

        customer.loanAmount = amount;

        customer.state = "CONFIRM_LOAN";

        await customer.save();

        await sendButtonMessage(
            phone,

            `Loan Type: ${customer.loanType}

Requested Amount: ₹${amount.toLocaleString("en-IN")}

Would you like to continue?`,

            [
                {
                    id: "CONFIRM_LOAN",
                    title: "Continue",
                },

                {
                    id: "CANCEL_LOAN",
                    title: "Cancel",
                },
            ]
        );

        return;
    }


    /**
     * CONFIRM
     */
    if (buttonId === "CONFIRM_LOAN") {

        customer.state = "COLLECT_NAME";

        await customer.save();

        await sendTextMessage(
            phone,

            "Please enter your full name."
        );

        return;
    }


    /**
     * CANCEL
     */
    if (buttonId === "CANCEL_LOAN") {

        customer.loanType = "";
        customer.loanAmount = null;
        customer.state = "MAIN_MENU";

        await customer.save();

        await sendTextMessage(
            phone,

            "Your loan enquiry has been cancelled.\n\nType *Hi* to start again."
        );

        return;
    }


    /**
     * COLLECT NAME
     */
    if (customer.state === "COLLECT_NAME") {

        customer.name = text;
        customer.state = "APPLICATION_COMPLETE";

        await customer.save();

        await sendTextMessage(
            phone,

            `Thank you ${customer.name} 🙏

Your loan enquiry has been registered.

Loan Type:
${customer.loanType}

Amount:
₹${customer.loanAmount.toLocaleString("en-IN")}

Our team will contact you shortly.

Thank you for choosing Elite Loan Associates.`
        );

        return;
    }


    /**
     * LOAN INFO
     */
    if (buttonId === "LOAN_INFO") {

        await sendTextMessage(
            phone,

            `🏦 Loan Information

We provide assistance for:

• Personal Loans
• Business Loans
• Home Loans

Type *Hi* to return to the main menu.`
        );

        return;
    }


    /**
     * SUPPORT
     */
    if (buttonId === "SUPPORT") {

        await sendTextMessage(
            phone,

            `📞 Customer Support

Our support team can help you with:

• Loan application
• Application status
• Documentation
• General enquiries

You can contact our support team during business hours.

Type *Hi* to return to the main menu.`
        );

        return;
    }


    /**
     * DEFAULT
     */
    await sendButtonMessage(
        phone,

        `Sorry, I didn't understand that. 🤖

Please choose an option below.`,

        [
            {
                id: "MAIN_MENU",
                title: "Main Menu",
            },

            {
                id: "SUPPORT",
                title: "Support",
            },
        ]
    );
};


module.exports = {
    processMessage,
};