import axios from 'axios';

let base = '';

if(import.meta.env.DEV) {
    base = '/api';
}

export const postDownloadPdf = async (agreementType, placeholders) => {
    const { data } = await axios.post(`.${base}/download/current`, {
        agreementType: agreementType,
        placeholders: placeholders
    }, {
        responseType: 'blob', 
    });

    return data;
}

export const postDownloadThroughSearchQuery = async (data) => {
    const res = await axios.post(`.${base}/download/multiple`, data, {
        responseType: 'blob', 
    });

    return res.data;
}

export const postDownloadThroughId = async (id) => {
    const res = await axios.post(`.${base}/download/single`, { documentId: id }, {
        responseType: 'blob', 
    });

    const headers = res.headers;

    const contentDisposition = headers['content-disposition'];
    let filename = '';

    if (contentDisposition && contentDisposition.indexOf('attachment') !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) { 
            filename = matches[1].replace(/['"]/g, '');
        }
    }

    const data = res.data;

    return { filename, data };
}