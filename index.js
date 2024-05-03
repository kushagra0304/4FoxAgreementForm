function loadFile(url, callback) {
    PizZipUtils.getBinaryContent(url, callback);
}

window.generate = function generate() {
    loadFile(
        "./template.docx",
        function (error, content) {
            if (error) {
                throw error;
            }
            const zip = new PizZip(content);
            const doc = new window.docxtemplater(zip, {
                paragraphLoop: true,
                linebreaks: true,
            });


            var DateOfAgreementExecution = document.getElementById("DateOfAgreementExecution").value;
            var ClientName = document.getElementById("ClientName").value;
            var ConstitutionOfBusiness = document.getElementById("ConstitutionOfBusiness").value;
            var ClientAddress = document.getElementById("ClientAddress").value;
            var SellersRepresentativeDesignation = document.getElementById("SellersRepresentativeDesignation").value;
            var AgreementTimePeriod = document.getElementById("AgreementTimePeriod").value;
            var MarketPlace = document.getElementById("MarketPlace").value;
            var PackageDuration = document.getElementById("PackageDuration").value;
            var AdvancePackageAmount = document.getElementById("AdvancePackageAmount").value;
            var TermsConditionsOfSales = document.getElementById("TermsConditionsOfSales").value;

            // Create JavaScript object with name-value pairs
            var formData = {
                DateOfAgreementExecution: DateOfAgreementExecution,
                ClientName: ClientName,
                ConstitutionOfBusiness: ConstitutionOfBusiness,
                ClientAddress: ClientAddress,
                SellersRepresentativeDesignation: SellersRepresentativeDesignation,
                AgreementTimePeriod: AgreementTimePeriod,
                MarketPlace: MarketPlace,
                PackageDuration: PackageDuration,
                AdvancePackageAmount: AdvancePackageAmount,
                TermsConditionsOfSales: TermsConditionsOfSales
            };

            doc.render(formData);

            const blob = doc.getZip().generate({
                type: "blob",
                mimeType:
                    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                // compression: DEFLATE adds a compression step.
                // For a 50MB output document, expect 500ms additional CPU time
                compression: "DEFLATE",
            });
            // Output the document using Data-URI
            saveAs(blob, "output.docx");
        }
    );
};