const templateModel = require("../schemas/template");
const fs = require('fs').promises;
const path = require('path');

async function deleteAllFilesInFolder(folderPath) {
    const files = await fs.readdir(folderPath);

    for (const file of files) {
        const filePath = path.join(folderPath, file);
        const stat = await fs.stat(filePath);

        if (stat.isFile()) {
            await fs.unlink(filePath);
        }
    }
}

const clearTemplateFolderAndDownloadAllTemplates = async () => {
    try {
        await deleteAllFilesInFolder(path.join(__dirname, './templates'));

        const templates = await templateModel.find({});

        for(const template of templates) {
            const filePath = path.join(__dirname, `./templates/${template.type}.html`);
            await fs.writeFile(filePath, template.template, (e) => {
                if(e) {
                    console.log(e);
                }
            });
        }
    } catch (e) {
        console.log("Failed to write templates", e);
    }
}

// updates the files in the DB and saves them if not in DB.
const updateAndSaveTemplates = async () => {
    try {
        const templatesFolder = path.join(__dirname, './templates')

        const files = await fs.readdir(templatesFolder);

        for (const file of files) {
            const filePath = path.join(templatesFolder, file);
            const stat = await fs.stat(filePath);

            if (stat.isFile()) {
                const templateType = path.parse(file).name;

                const template = await templateModel.findOne({ type: templateType });

                const templateBuffer = await fs.readFile(filePath);

                if(template) {
                    template.template = templateBuffer;
                    await template.save();
                } else {
                    await templateModel.create({
                        template: templateBuffer,
                        type: templateType
                    });
                }
            }
        }
    } catch (e) { 
        console.log("Failed to update some or all templates", e);
    }
}
    
module.exports = { clearTemplateFolderAndDownloadAllTemplates, updateAndSaveTemplates }