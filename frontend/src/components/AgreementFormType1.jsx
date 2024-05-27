import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

const FormControlTemplate = ({ id, label, invalidFeedback }) => {
    return (
        <Form.Group className="mb-3" controlId={id}>
            <Form.Label>{label}</Form.Label>
            <InputGroup hasValidation>
                <Form.Control
                type="text"
                name={id}
                required
                />
                <Form.Control.Feedback type="invalid">{invalidFeedback}</Form.Control.Feedback>
            </InputGroup>
        </Form.Group>
    )
}

const AgreementFormType1 = () => {
    return (
        <>
            <FormControlTemplate id="ClientName" label="Client Name" invalidFeedback="Please enter the client name."/>
            <FormControlTemplate id="clientAddress" label="Client Address" invalidFeedback="Please enter the client address."/>
        </>
    )
}

export default AgreementFormType1;