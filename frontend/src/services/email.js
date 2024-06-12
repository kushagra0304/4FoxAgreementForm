import axios from 'axios';

// No point in handling errors here.

export const postDownloadPdf = async (agreementType, placeholders) => {
    const { data } = await axios.post(`./email/download`, {
        agreementType: agreementType,
        placeholders: placeholders
    }, {
        responseType: 'blob', 
    });

    return data;
}

export const postSendEmail = async (agreementType, placeholders, mailDetails) => {
    await axios.post(`./email/send`, {
        agreementType: agreementType,
        placeholders: placeholders,
        mailDetails: mailDetails
    });
}