import axios from 'axios';

// No point in handling errors here.

export const postSendEmail = async (agreementType, placeholders, mailDetails) => {
    await axios.post(`./email/send`, {
        agreementType: agreementType,
        placeholders: placeholders,
        mailDetails: mailDetails
    });
}

export const deleteEmail = async (id) => {
    await axios.delete(`./email`, {
        documentId: id
    });
}