const { default: axios } = require("axios");
const { generatePDF } = require("../utils/generateTemplate");
const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require('../schemas/email');
const { addBrTagsInplaceNewline, addAddresses } = require("../utils/helper");
const { createClientPageURL } = require("../utils/client");

router.post('/send', async (request, response, next) => {
    try {
        if(request.errorInAuth) {
            next({name: "ValidationError"});
            return;
        }

        const { accessToken, userData, userId } = request
        const { agreementType, placeholders, mailDetails } = request.body 

        const headers = {
            'Content-Type': 'application/octet-stream',
            "Authorization": `Zoho-oauthtoken ${accessToken}`
        };

        const pdfBuffer = await generatePDF({ agreementType, placeholders });

        const uploadAttachmentRes = await axios.post(
            `https://mail.zoho.in/api/accounts/${userData.zohoAccountId}/messages/attachments?fileName=Agreement-form.pdf`, 
            pdfBuffer, 
            { headers }
        )

        if(uploadAttachmentRes.data.status.code !== 200) {
            throw new error("Failed to upload attachment to zoho");
        }

        const emailDataToSave = {
            userId: userId,
            from: userData.emailAddress,
            to: mailDetails.toAddress,
            cc: mailDetails.ccAddress,
            subject: mailDetails.subject || "",
            body: mailDetails.content || "",
            agreementType: agreementType,
            clientAgreed: false,
        }

        for (const [key, value] of Object.entries(placeholders)) {
            console.log(key, value);
            emailDataToSave[`agreementFormData_${key}`] = value;
        }

        const savedEmail = await emailModel.create(emailDataToSave)

        userData.emails.push(savedEmail._id);
        userData.save();

        const clientPageURL = await createClientPageURL(savedEmail._id);

        const data = {
            fromAddress: userData.emailAddress,
            toAddress: (savedEmail.to || []).join(','),
            ccAddress: (savedEmail.cc || []).join(','),
            subject: savedEmail.subject,
            content: addBrTagsInplaceNewline(savedEmail.body) + "<br>" + `Agreement link -> ${clientPageURL}`,
            askReceipt : "yes",
            attachments: [{
                storeName: uploadAttachmentRes.data.data.storeName,
                attachmentPath: uploadAttachmentRes.data.data.attachmentPath,
                attachmentName: uploadAttachmentRes.data.data.attachmentName
            }]
        }

        const sendMailRes = await axios.post(`https://mail.zoho.in/api/accounts/${userData.zohoAccountId}/messages`, data, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`
            }
        })

        if(sendMailRes.data.status.code !== 200) {
            throw new Error("Could not send mail");
        }

        response.send();

        await addAddresses(mailDetails.toAddress, mailDetails.ccAddress);
    } catch(error) {
        logger.debug(error);
        response.status(500).send(error.message);
    }
})

module.exports = router;