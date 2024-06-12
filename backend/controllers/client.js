const logger = require("../utils/logger");
const router = require('express').Router();
const cache = require("../utils/cache");
const clientModel = require("../schemas/client");
const emailModel = require("../schemas/email");
const { generateHTML } = require("../utils/generateTemplate");
const { extractAgreementFormDataFieldsAndStripThem } = require("../utils/helper");
const userModel = require("../schemas/user");
const { default: axios } = require("axios");
const fs = require("fs");
const path = require("path");

router.get('', async (request, response, next) => {
    try {
        const { token: clientId } = request.query;

        const client = await clientModel.findById(clientId);

        if(!client) {
            response.status(404).send("Client not found");
            return;
        }

        const email = await emailModel.findById(client.emailId);

        const placeholder = extractAgreementFormDataFieldsAndStripThem(email);

        const templateHTML = await generateHTML({ placeholders: placeholder, agreementType: email.agreementType});

        const toInjectHTML = `
            <div style="margin-top: 1rem">
                <form action="" method="POST">
                    <button style="
                        height: 3rem;
                        width: 6rem;
                        font-size: 1rem;
                        margin-bottom: 1rem;
                        background-color: #0d6efd;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        font-weight: 500;
                        cursor: pointer;
                        "
                        type="submit">I agree</button>
                </form>
            </div>`

        const bodyCloseTagIndex = templateHTML.indexOf('</body>');

        let html = templateHTML;

        if (bodyCloseTagIndex !== -1) {
            html = templateHTML.slice(0, bodyCloseTagIndex) + toInjectHTML + templateHTML.slice(bodyCloseTagIndex);
        }

        response.send(html);
    } catch(error) {
        next(error)
    }
})


router.post('', async (request, response, next) => {
    try {
        const { token: clientId } = request.query;

        const client = await clientModel.findById(clientId);

        const email = await emailModel.findById(client.emailId);

        const userData = await userModel.findById(email.userId);

        const data = {
            fromAddress: userData.emailAddress,
            toAddress: email.to.join(','),
            subject: "FourFox T&C confirmation",
            content: "You are reciving this mail because you agreed to FourFox Terms and Condition, If you think this is a mistake please revert back to us.",
            askReceipt : "yes",
        }

        const sendMailRes = await axios.post(`https://mail.zoho.in/api/accounts/${userData.zohoAccountId}/messages`, data, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${userData.accessToken}`
            }
        })

        if(sendMailRes.data.status.code !== 200) {
            throw new Error("Could not send confirmation mail");
        }

        await client.deleteOne();

        email.clientAgreed = true;
        await email.save();

        response.send((await fs.promises.readFile(path.join(__dirname, "../public/clientVerification.html"))).toString());
    } catch(error) {
        next(error)
    }
})

module.exports = router;