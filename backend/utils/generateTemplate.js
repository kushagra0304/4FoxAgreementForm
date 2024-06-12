const cache = require("./cache");
const templateModel = require('../schemas/template');

const generatePDF = async (data) => {
    const { placeholders, agreementType } = data
    const page = await cache.getBrowser().newPage();

    const templateBuffer = (await templateModel.findOne({ type: agreementType })).template;

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

    await page.close();

    return pdfBuffer;
}


const generateHTML = async (data) => {
    const { placeholders, agreementType } = data;
    const page = await cache.getBrowser().newPage();

    const templateBuffer = (await templateModel.findOne({ type: agreementType })).template;

    await page.setContent(templateBuffer.toString());

    await page.evaluate((placeholders) => {
        for (const [key, value] of Object.entries(placeholders)) {
            const pattern = new RegExp(`{${key}}`, 'g');
            document.body.innerHTML = document.body.innerHTML.replace(pattern, value);
        }
    }, placeholders);

    const htmlContent = await page.content(); // Get the HTML content of the page

    await page.close(); // Close the page to free up resources

    return htmlContent;
};

module.exports = {
    generatePDF,
    generateHTML
}