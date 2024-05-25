const logger = require("../utils/logger");
const router = require('express').Router();
const emailModel = require("../schemas/email");
const { generatePDF } = require("../utils/generatePDF");
const archiver = require('archiver');
const fs = require('fs');

function convertObject(originalObj) {
    const newObj = {};
    for (const key in originalObj) {
        if (originalObj.hasOwnProperty(key)) {
            if (key.startsWith('agreementFormData_')) {
                const newKey = key.replace('agreementFormData_', '');
                newObj[newKey] = originalObj[key];
            } else {
                newObj[key] = originalObj[key];
            }
        }
    }
    return newObj;
}

router.post('', async (request, response) => {
    try {
        if(request.errorInAuth) {
            logger.error('Unauthorized operation');
            response.status(401).send('Unauthorized operation');
            return;
        }

        const { documentIds } = request.body;

        // Sample documentIds for testing
        // const documentIds = ["6650c6396fded61aa118b704", "66516830e2fe11ba71b6edae"];

        const pdfBuffers = [];

        for(const documentId of documentIds) {
            let document;
            try {
                document = await emailModel.findById(documentId);
                if (!document) {
                    throw new Error(`Document not found for ID: ${documentId}`);
                }
                
                document = convertObject(document._doc);

                const pdfBuffer = await generatePDF({ placeholders: document, agreementType: document.agreementType });

                pdfBuffers.push({ buffer: pdfBuffer, name: `document_${document.ClientName}_${documentId}.pdf` });
            } catch (error) {
                logger.error(`Error processing document ID ${documentId}: ${error.message}`);
                response.status(404).send(`Document not found for ID: ${documentId}`);
                return;
            }
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

module.exports = router;