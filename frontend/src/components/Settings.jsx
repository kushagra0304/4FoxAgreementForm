import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import CreatableSelect from 'react-select/creatable';
import Alert from 'react-bootstrap/Alert';
import { useEffect, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import * as accessService from '../services/access'


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

const Settings = () => {
    const [alertData, setAlertData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [ownerAccess, setOwnerAccess] = useState(false);
    const [hrAccess, setHrAccess] = useState(false);
    const [hrAddress, setHrAddress] = useState("");
    const [empAddresses, setEmpAddresses] = useState([]);
    const [setHrAddressFormNotValid, setSetHrAddressFormNotValid] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const ownerAccess = await accessService.getOwnerAccess();
                const hrAccess = await accessService.getHrAccess();

                if(ownerAccess) {
                    setOwnerAccess(true);

                    setHrAddress(await accessService.getHrAddress());
                } 

                if(hrAccess || ownerAccess) {
                    setHrAccess(true);

                    setEmpAddresses(await accessService.getEmployeeAddresses());
                } 

                setLoading(false);
            } catch(err) {
                setAlertData({ variant: 'danger', message: "Operation unsuccessful, Please try again later." })
                setError(true);
            }
        })();
    }, [])

    const changeHrAddress = async () => {
        const form = document.getElementById("setHrAddressForm");

        if(!form.checkValidity()) {
            setSetHrAddressFormNotValid(true);
            return;
        }

        try {
            await accessService.postHrAddress(hrAddress);

            setAlertData({ variant: 'success', message: "Operation successfull" })
        } catch(e) {
            setAlertData({ variant: 'danger', message: "Operation unsuccessful, Please try again later." })
        }
    }

    const changeEmployeeAddresses = async () => {
        try {
            await accessService.postEmployeeAddresses(empAddresses);

            setAlertData({ variant: 'success', message: "Operation successfull" })
        } catch(e) {
            setAlertData({ variant: 'danger', message: "Operation unsuccessful, Please try again later." })
        }
    }

    return (
        <div className="settings">
            <MyAlert data={alertData}/>
            { loading ? (error ? <></> : <MySpinner/>) :
                <>
                    { ownerAccess ? 
                    <>
                        <Form noValidate validated={setHrAddressFormNotValid} className='mb-3' id='setHrAddressForm'>
                            <Form.Group className="mb-3" controlId="setHR">
                                <Form.Label>HR Address</Form.Label>
                                <Form.Control required type="email" placeholder="Enter email" value={hrAddress} onChange={(e) => setHrAddress(e.target.value)}/>
                            </Form.Group>
                        </Form>
                        <Button variant="primary" type="click" onClick={changeHrAddress}>
                                Submit
                        </Button>
                    </>
                    : <></> }
                    { hrAccess ?
                    <div className="mb-3">
                        <label className='mb-2'>Employees Addresses</label>
                        <CreatableSelect className='mb-3' isMulti theme={(theme) => ({
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
                                value={empAddresses.map((address) => ({value: address, label: address}))}
                                onChange={(selectedAddresses) => setEmpAddresses(selectedAddresses.map((address) => address.value))}
                            />
                        <Button variant="primary" type="click" onClick={changeEmployeeAddresses}>
                            Submit
                        </Button>
                    </div>
                    : <></>}
                </>
            }
        </div>
    )
}

export default Settings;