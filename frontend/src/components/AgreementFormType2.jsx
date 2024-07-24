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
        
        </>
    )
}

export default AgreementFormType2;