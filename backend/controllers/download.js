const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require("../schemas/email");
const { generatePDF } = require("../utils/generateTemplate");
const archiver = require('archiver');
const { extractAgreementFormDataFieldsAndStripThem } = require("../utils/helper");
const { searchInEmails } = require("../utils/search");

// router.post('/multiple', async (request, response) => {
//     try {
//         if(request.errorInAuth) {
//             next({ name: "ValidationError" });
//             return;
//         }

//         const { documentIds } = request.body;

//         const pdfBuffers = [];

//         for(const documentId of documentIds) {
//             let document;
//             try {
//                 document = await emailModel.findById(documentId);
//                 if (!document) {
//                     throw new Error(`Document not found for ID: ${documentId}`);
//                 }
                
//                 document = extractAgreementFormDataFieldsAndStripThem(document._doc);

//                 const pdfBuffer = await generatePDF({ placeholders: document, agreementType: document.agreementType });

//                 pdfBuffers.push({ buffer: pdfBuffer, name: `document_${document.ClientName}_${documentId}.pdf` });
//             } catch (error) {
//                 logger.error(`Error processing document ID ${documentId}: ${error.message}`);
//                 response.status(404).send(`Document not found for ID: ${documentId}`);
//                 return;
//             }
//         }

//         // Set headers for zip file
//         response.setHeader('Content-Type', 'application/zip');
//         response.setHeader('Content-Disposition', 'attachment; filename="agreementforms.zip"');

//         // Create a zip file using archiver
//         const zip = archiver('zip', {
//             zlib: { level: 9 } // Sets the compression level.
//         });

//         // Pipe the zip file to the response
//         zip.pipe(response);

//         // Add files to the zip file
//         for (const { buffer, name } of pdfBuffers) {
//             zip.append(buffer, { name });
//         }

//         // Finalize the zip file
//         zip.finalize();
//     } catch(error) {
//         logger.debug(`Error generating agreement forms: ${error.message}`);
//         response.status(500).send(error.message);
//     }
// });

router.post('/multiple', async (request, response) => {
    try {
        if(request.errorInAuth) {
            next({ name: "ValidationError" });
            return;
        }

        const documents = await searchInEmails(request.body);

        const pdfBuffers = [];

        for(let document of documents) {
            document = extractAgreementFormDataFieldsAndStripThem(document._doc);

            const pdfBuffer = await generatePDF({ placeholders: document, agreementType: document.agreementType });

            pdfBuffers.push({ buffer: pdfBuffer, name: `document_${document.ClientName}_${document._id}.pdf` });
        }

        // Set headers for zip file
        response.setHeader('Content-Type', 'application/zip');
        response.setHeader('Content-Disposition', 'attachment; filename="agreementforms.zip"');

        // Create a zip file using archiver
        const zip = archiver('zip', {
            zlib: { level: 9 } // Sets the compression level.
        });

        // Pipe the zip file to the response
        zip.pipe(response);

        // Add files to the zip file
        for (const { buffer, name } of pdfBuffers) {
            zip.append(buffer, { name });
        }

        // Finalize the zip file
        zip.finalize();
    } catch(error) {
        logger.debug(`Error generating agreement forms: ${error.message}`);
        response.status(500).send(error.message);
    }
});

router.post('/single', async (request, response) => {
    try {
        if(request.errorInAuth) {
            next({ name: "ValidationError" });
            return;
        }

        const { documentId } = request.body;

        let document = await emailModel.findById(documentId);
        document = extractAgreementFormDataFieldsAndStripThem(document._doc);

        const pdfBuffer = await generatePDF({ placeholders: document, agreementType: document.agreementType });

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', `attachment; filename="document_${document.ClientName}_${document._id}.pdf"`);
        response.setHeader('Content-Length', pdfBuffer.length);
        response.end(pdfBuffer);
    } catch(error) {
        logger.debug(`Error generating agreement forms: ${error.message}`);
        response.status(500).send(error.message);
    }
});

router.post('/current', async (request, response) => {
    try {
        const { agreementType, placeholders } = request.body;
        let pdfBuffer;

        pdfBuffer = await generatePDF({ agreementType, placeholders });

        response.setHeader('Content-Type', 'application/pdf');
        response.setHeader('Content-Disposition', 'attachment; filename="agreement-form.pdf"');
        response.setHeader('Content-Length', pdfBuffer.length);
        response.end(pdfBuffer);
    } catch(error) {
        console.log(error)
        response.status(500).send("Error converting to pdf.");
    }
})

module.exports = router;