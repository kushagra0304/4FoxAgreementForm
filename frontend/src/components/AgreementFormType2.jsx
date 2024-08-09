import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

const FormControlTemplate = ({ id, label, invalidFeedback, type = "text" }) => {
    return (
        <Form.Group className="mb-3" controlId={id}>
            <Form.Label>{label}</Form.Label>
            <InputGroup hasValidation>
                <Form.Control
                {...(type == "text" && { type: "text" })}
                {...(type == "textarea" && { as: "textarea" })}
                name={id}
                required
                />
                <Form.Control.Feedback type="invalid">{invalidFeedback}</Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    )
}

const AgreementFormType2 = () => {
    return (
        <>
            <FormControlTemplate id="agreementExecutionDate" label="Agreement Execution Date" invalidFeedback="Please enter the Agreement Execution Date"/>
            <FormControlTemplate id="clientCompanyName" label="Client Company Name" invalidFeedback="Please enter the Client Company Name"/>
            <FormControlTemplate id="firmType" label="Firm Type" invalidFeedback="Please enter the Firm Type"/>
            <FormControlTemplate id="clientAddress" label="Client Address" invalidFeedback="Please enter the Client Address"/>
            <FormControlTemplate id="clientName" label="Client Name" invalidFeedback="Please enter the Client Name"/>
            <FormControlTemplate id="socialMediaAccountManagement" label="Social Media Account Management" invalidFeedback="Please enter the Social Media Account Management" type='textarea'/>
            <FormControlTemplate id="socialMediaAdsManagement" label="Social Media Ads Management" invalidFeedback="Please enter the Social Media Ads Management" type='textarea'/>
            <FormControlTemplate id="timePeriod" label="Time Period" invalidFeedback="Please enter the Time Period"/>
            <FormControlTemplate id="agreementStartDate" label="Agreement Start Date" invalidFeedback="Please enter the Agreement Start Date"/>
            <FormControlTemplate id="servicePackageDurationAndFee" label="Service Package Duration And Fee" invalidFeedback="Please enter the Service Package Duration And Fee" type='textarea'/>
        </>
    )
}

export default AgreementFormType2;