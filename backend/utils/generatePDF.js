const { default: puppeteer } = require("puppeteer");
const fs = require("fs");
const path = require('path');
const cache = require("./cache");

const generatePDF = async (data) => {
    const { placeholders, agreementType } = data
    const page = await cache.getBrowser().newPage();

    const templateBuffer = await fs.promises.readFile(path.join(__dirname, `./templates/agreement_form_${agreementType}.html`));

    await page.setContent(templateBuffer.toString());

    await page.evaluate((placeholders) => {    
        for (const [key, value] of Object.entries(placeholders)) {
          const pattern = new RegExp(`{${key}}`, 'g');
          document.body.innerHTML = document.body.innerHTML.replace(pattern, value);
        }
    }, placeholders);

    const pdfBuffer = await page.pdf({
        format: 'A4',
    });

    return pdfBuffer;
}

module.exports = {
    generatePDF
}