const { default: axios } = require("axios");
const { generatePDF } = require("../utils/generateTemplate");
const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require('../schemas/email');
const { addBrTagsInplaceNewline, addAddresses } = require("../utils/helper");
const { createClientPageURL } = require("../utils/client");
const userModel = require("../schemas/user");
const clientModel = require("../schemas/client");
const { default: mongoose } = require("mongoose");

router.post('/send', async (request, response, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        if (request.errorInAuth) {
            next({ name: "ValidationError" });
            return;
        }

        const { accessToken, userData, userId } = request;
        const { agreementType, placeholders, mailDetails } = request.body;

        const headers = {
            'Content-Type': 'application/octet-stream',
            "Authorization": `Zoho-oauthtoken ${accessToken}`
        };

        const pdfBuffer = await generatePDF({ agreementType, placeholders });

        const uploadAttachmentRes = await axios.post(
            `https://mail.zoho.in/api/accounts/${userData.zohoAccountId}/messages/attachments?fileName=Agreement-form.pdf`,
            pdfBuffer,
            { headers }
        );

        if (uploadAttachmentRes.data.status.code !== 200) {
            throw new Error("Failed to upload attachment to Zoho");
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
        };

        for (const [key, value] of Object.entries(placeholders)) {
            emailDataToSave[`agreementFormData_${key}`] = value;
        }

        const savedEmail = await emailModel.create([emailDataToSave], { session });

        userData.emails.push(savedEmail[0]._id);
        await userData.save({ session });

        const clientPageURL = await createClientPageURL(savedEmail[0]._id);

        const data = {
            fromAddress: userData.emailAddress,
            toAddress: (savedEmail[0].to || []).join(','),
            ccAddress: (savedEmail[0].cc || []).join(','),
            subject: savedEmail[0].subject,
            content: addBrTagsInplaceNewline(savedEmail[0].body) + "<br>" + `Agreement link -> ${clientPageURL}`,
            askReceipt: "yes",
            attachments: [{
                storeName: uploadAttachmentRes.data.data.storeName,
                attachmentPath: uploadAttachmentRes.data.data.attachmentPath,
                attachmentName: uploadAttachmentRes.data.data.attachmentName
            }]
        };

        const sendMailRes = await axios.post(`https://mail.zoho.in/api/accounts/${userData.zohoAccountId}/messages`, data, {
            headers: {
                "Authorization": `Zoho-oauthtoken ${accessToken}`
            }
        });

        if (sendMailRes.data.status.code !== 200) {
            throw new Error("Could not send mail");
        }

        await session.commitTransaction();
        session.endSession();

        response.send();
        await addAddresses(mailDetails.toAddress, mailDetails.ccAddress);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        logger.debug(error);
        response.status(500).send(error.message);
    }
});


router.delete('', async (request, response, next) => {
    try {
        if(request.errorInAuth) {
            next({ name: "ValidationError" });
            return;
        }

        const { documentId } = request.body;

        const deletedEmail = await emailModel.findOneAndDelete(documentId);

        await clientModel.findOneAndDelete({ emailId: deletedEmail.id });

        await userModel.updateOne(
            { _id: deletedEmail.userId },
            { $pull: { emails: deletedEmail.id }}
        );

        response.send();
    } catch(error) {
        logger.debug(error)
        response.status(500).send(error.message);
    }
})

module.exports = router;