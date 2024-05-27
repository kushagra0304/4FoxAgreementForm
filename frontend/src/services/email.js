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