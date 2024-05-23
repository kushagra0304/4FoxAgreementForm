const { default: axios } = require("axios");
const { generatePDF } = require("../utils/generatePDF");
const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require('../schemas/email');

router.post('/send', async (request, response) => {
    try {
        const { accessToken, userData, userId } = request
        const { agreementType, placeholders, mailDetails } = request.body 

        if(!accessToken) {
            throw new Error("Access token not set");            
        }

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

        const data = {
            fromAddress: userData.emailAddress,
            toAddress: mailDetails.toAddress,
            ccAddress: mailDetails.ccAddress,
            subject: mailDetails.subject,
            content: mailDetails.content,
            askReceipt : "yes",
            attachments: [
                {
                storeName: uploadAttachmentRes.data.data.storeName,
                attachmentPath: uploadAttachmentRes.data.data.attachmentPath,
                attachmentName: uploadAttachmentRes.data.data.attachmentName
                }
            ]
        }

        sendMailRes = await axios.post(`https://mail.zoho.in/api/accounts/${userData.zohoAccountId}/messages`, data, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`
            }
        })

        if(sendMailRes.data.status.code !== 200) {
            throw new Error("Could not send mail");
        } 

        const emailDataToSave = {
            userId: userId,
            from: userData.emailAddress,
            to: mailDetails.toAddress,
            cc: mailDetails.ccAddress,
            subject: mailDetails.subject || "",
            body: mailDetails.content || "",
            agreementType: agreementType,
        }

        for (const [key, value] of Object.entries(placeholders)) {
            emailDataToSave[`agreementFormData_${key}`] = value;
        }

        const newEmail = new emailModel(emailDataToSave);

        const savedEmail = await newEmail.save();

        logger.debug(savedEmail);

        response.send();
    } catch(error) {
        logger.debug(error);
        response.status(500).send(error.message);
    }
})

router.post('/download', async (request, response) => {
    const { agreementType, placeholders } = request.body;
    // console.log(placeholders)
    let pdfBuffer;

    try {
        pdfBuffer = await generatePDF({ agreementType, placeholders });
    } catch(error) {
        console.log(error)
        response.status(500).send("Error converting to pdf.");
        return;
    }

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'attachment; filename="agreement-form.pdf"');
    response.setHeader('Content-Length', pdfBuffer.length);
    response.end(pdfBuffer);
    return;
})

module.exports = router;