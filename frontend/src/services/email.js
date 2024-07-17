import axios from 'axios';

let base = '';

if(import.meta.env.DEV) {
    base = '/api';
}

// No point in handling errors here.

export const postSendEmail = async (agreementType, placeholders, mailDetails) => {
    await axios.post(`.${base}/email/send`, {
        agreementType: agreementType,
        placeholders: placeholders,
        mailDetails: mailDetails
    });
}

export const deleteEmail = async (id) => {
    await axios.delete(`.${base}/email`, {
        documentId: id
    });
}