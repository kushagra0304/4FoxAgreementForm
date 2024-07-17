import { useEffect, useState } from 'react';
import './sendMail.css'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import CreatableSelect from 'react-select/creatable';
import Alert from 'react-bootstrap/Alert';
import { postSendEmail } from '../services/email';
import { postDownloadPdf } from '../services/download';
import AgreementFormType1 from './AgreementFormType1';
import { getAddress } from '../services/address';
import Spinner from 'react-bootstrap/Spinner';

function MySpinner() {
    return (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
}

function MyAlert({ data }) {
    const [timeoutId, setTimeoutId] = useState("");
    const [show, setShow] = useState(false);

    useEffect(() => {
        if(data.variant && data.message) {
            clearTimeout(timeoutId);

            setShow(true);

            const timeoutid = setTimeout(() => {
                setShow(false);
            }, 5000)

            setTimeoutId(timeoutid);
        }
    }, [data]);

    if(show) {
        return (
            <Alert variant={data.variant} onClose={() => setShow(false)} dismissible>{data.message}</Alert>
        );
    } else {
        return <></>;
    }
}

const SendMail = () => {
    const [pdfFormNotValidated, setPdfFormNotValidated] = useState(false);
    const [emailFormNotValidated, setEmailFormNotValidated] = useState(false);
    const [disableBothForm, setDisableBothForm] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [alertText, setAlertText] = useState(false);
    const [alertTimeOutInfo, setAlertTimeOutInfo] = useState({ bool: true, timeoutId: NaN})
    const [disableBothFormBtn, setDisableBothFormBtn] = useState(false);
    const [recipients, setRecipients] = useState([]);
    const [cc, setCc] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [alertData, setAlertData] = useState({});

    const fetchAddresses = async () => {
        const { addresses } = await getAddress()
        setAddresses(addresses);
    }

    useEffect(() => {
        fetchAddresses();
    }, [])

    const toggleForm = () => {
        setDisableBothForm(bool => !bool);
        setDisableBothFormBtn(bool => !bool);
    }

    const handleDownloadPDF = async () => {
        if(disableBothForm) { return; }

        try {
            toggleForm();

            const pdfForm = document.getElementById("pdfForm");

            if (pdfForm.checkValidity() === false) {
                setPdfFormNotValidated(true);
                throw new Error("Form invalid");
            }
        
            const formData = new FormData(pdfForm);
        
            const placeholders = {}
            for (const [key, value] of formData.entries()) {
                placeholders[key] = value;
            }

            const data = await postDownloadPdf("first", placeholders);

            const url = window.URL.createObjectURL(new Blob([data]));
            const link = document.createElement('a');
            link.href = url;
            link.download = 'Agreement_Form.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            setAlertData({ variant: 'success', message: "Operation successful" })
        } catch(error) {
            if(error.message === "Form invalid") {
                setAlertData({ variant: 'danger', message: "Please fill all fields" })
            } else {
                setAlertData({ variant: 'danger', message: "Operation unsuccessful, Please try again later." })
            }
        }

        toggleForm();
    };

    const handleSendMail = async () => {
        if(disableBothForm) { return; }

        try {
            toggleForm();

            const emailForm = document.getElementById("emailForm");
            const pdfForm = document.getElementById("pdfForm");

            if (emailForm.checkValidity() === false || pdfForm.checkValidity() === false) {
                setPdfFormNotValidated(true);
                setEmailFormNotValidated(true)
                throw new Error("Form invalid");
            }

            const emailFormData = new FormData(emailForm);
            const pdfFormData = new FormData(pdfForm);
    
            const recipientsData = recipients.map(option => option.value);
            const ccData = cc.map(option => option.value);

            const mailDetails = {}
            for (const [key, value] of emailFormData.entries()) {
                mailDetails[key] = value;
            }

            mailDetails['toAddress'] = recipientsData;
            mailDetails['ccAddress'] = ccData;

            const pdfPlaceholders = {}
            for (const [key, value] of pdfFormData.entries()) {
                pdfPlaceholders[key] = value;
            }

            await postSendEmail("first", pdfPlaceholders, mailDetails);

            fetchAddresses();

            setAlertData({ variant: 'success', message: "Sent Mail successfully" })
        } catch(error) {
            if(error.message === "Form invalid") {
                setAlertData({ variant: 'danger', message: "Please fill all fields" })
            } else {
                setAlertData({ variant: 'danger', message: "Operation unsuccessful, Please try again later." })
            }
        }

        toggleForm();
    }

    return (
        <div className="sendMail">
            <MyAlert data={alertData}/>
            <Alert variant="danger" show={showAlert}>{alertText}</Alert>
            <Form noValidate validated={emailFormNotValidated} id='emailForm' disabled={disableBothForm}>
                <div className="mb-3">
                    <label className="form-label">Recipients</label>
                    <CreatableSelect isMulti  theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary25: 'tomato',        
                        },
                        })} 
                        styles={{
                            input: (styles) => ({
                                ...styles,
                                color: '#dee2e6', // Set the desired color here
                            }),
                            multiValueRemove: (provided, state) => ({
                                ...provided,
                                color: state.isFocused ? 'red' : 'blue', // Change color based on the focused state
                            }),
                        }}
                        options={addresses.map((address) => ({value: address, label: address}))}
                        onChange={(selectedOptions) => setRecipients(selectedOptions)}
                    />
                </div>
                <div className="mb-3">
                    <label className="form-label">Carbon Copy</label>
                    <CreatableSelect isMulti  theme={(theme) => ({
                        ...theme,
                        colors: {
                            ...theme.colors,
                            primary25: 'tomato',        
                        },
                        })} 
                        styles={{
                            input: (styles) => ({
                                ...styles,
                                color: '#dee2e6', // Set the desired color here
                            }),
                            multiValueRemove: (provided, state) => ({
                                ...provided,
                                color: state.isFocused ? 'red' : 'blue', // Change color based on the focused state
                            }),
                        }}
                        options={addresses.map((address) => ({value: address, label: address}))}
                        onChange={(selectedOptions) => setCc(selectedOptions)}
                    />
                </div>
                <Form.Group className="mb-3" controlId="subject">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="subject"
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="content">
                    <Form.Label>Content</Form.Label>
                    <Form.Control 
                        as="textarea" 
                        rows={3} 
                        name="content"
                        required
                    />
                </Form.Group>
            </Form>
            <div className="mb-3" style={{height: '1px', backgroundColor: 'white'}}></div>
            <Form noValidate validated={pdfFormNotValidated} disabled={disableBothForm} id='pdfForm'>
                <AgreementFormType1/>
            </Form>
            {disableBothFormBtn ? 
            <MySpinner/> :
            <>
                <Button disabled={disableBothFormBtn} variant="primary" onClick={handleDownloadPDF} type="button">Download</Button>
                <Button disabled={disableBothFormBtn} variant="primary" onClick={handleSendMail} type="button" className='ms-2'>Send</Button>
            </>
            }
        </div>
    )
};

export default SendMail;
