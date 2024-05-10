const { PDFDocument, PDFName, PDFRawStream, decodePDFRawStream, arrayAsString } = require('pdf-lib');
const zlib = require('zlib');
const fs = require('fs');

// Can use either exact string or regex pattern
const rules = [
    {
        pattern: '{ClientName}',
        replacement: 'John Doe'
    }
];

const replaceText = async (data) => {
    const pdfDoc = await PDFDocument.load(data);

    const enumeratedIndirectObjects = pdfDoc.context.enumerateIndirectObjects();

    enumeratedIndirectObjects.forEach(([pdfRef, pdfObject]) => {
        if (!(pdfObject instanceof PDFRawStream)) {
            return;
        }

        if (pdfObject?.dict?.get(PDFName.of('Subtype')) === PDFName.of('Image')) {
            return;
        }

        let text = arrayAsString(decodePDFRawStream(pdfObject).decode());
        let modified = false;

        console.log(text)

        for (const rule of rules) {
            const newText = text.replace(rule.pattern, rule.replacement);

            if (newText !== text) {
                text = newText;

                modified = true;
            }
        }

        if (modified) {
            pdfObject.contents = zlib.deflateSync(text);
        }
    });

    const bytes = await pdfDoc.save();

    return Buffer.from(bytes);
};

replaceText(
    fs.readFileSync('template.pdf')
).then(buf => fs.writeFileSync('./result.pdf', buf));