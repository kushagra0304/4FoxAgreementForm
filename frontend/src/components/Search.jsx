import { useEffect, useState } from 'react';
import { Form, FormControl, Button, Container, Row, Col, Alert } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Pagination from 'react-bootstrap/Pagination';
import { getSearch } from '../services/search';
import Spinner from 'react-bootstrap/Spinner';
import ListGroup from 'react-bootstrap/ListGroup';
import { postDownloadThroughId, postDownloadThroughSearchQuery } from '../services/download';
import { deleteEmail } from '../services/email';

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

const SearchForm = ({ handleForm, searchInProgress, handleDownloadAll }) => {
    const [startDate, setStartDate] = useState();
    const [endDate, setEndDate] = useState();
    const [searchQuery, setSearchQuery] = useState('');
    const [from, setFrom] = useState(false);
    const [clientAgreed, setClientAgreed] = useState(false);

    const convertToISO = (date) => {
        return date ? date.toISOString() : '';
    };
    
    const handleCheckboxChange = (setter) => (e) => {
      setter(e.target.checked);
    };
  
    const handleSearchChange = (e) => {
      setSearchQuery(e.target.value);
    };
  
    const handleSubmit = (e) => {
      e.preventDefault();
      // Handle form submission logic here
      handleForm({
        startDate: convertToISO(startDate),
        endDate: convertToISO(endDate),
        searchQuery: searchQuery,
        from: from,
        clientAgreed: clientAgreed,
    })};
  
    return (
        <Form className="mb-3" onSubmit={handleSubmit}>
            <Row className="mb-3">
            <Col>
                <Form.Label>Start Date</Form.Label>
                <br/>
                <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                className="form-control"
                dateFormat="dd/MM/yyyy"
                />
            </Col>
            <Col>
                <Form.Label>End Date</Form.Label>
                <br/>
                <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                className="form-control"
                dateFormat="dd/MM/yyyy"
                />
            </Col>
            </Row>
            <Row className="mb-3">
            <Col>
                <FormControl 
                type="text" 
                placeholder="Search" 
                value={searchQuery}
                onChange={handleSearchChange}
                />
            </Col>
            </Row>
            <Row className="mb-3">
            <Col>
                <Form.Check
                type="checkbox"
                label="From me"
                checked={from}
                onChange={handleCheckboxChange(setFrom)}
                />
            </Col>
            <Col>
                <Form.Check
                type="checkbox"
                label="Agreed forms"
                checked={clientAgreed}
                onChange={handleCheckboxChange(setClientAgreed)}
                />
            </Col>
            </Row>
            {
            searchInProgress ? 
            <MySpinner/> : 
            <div>
                <Button variant="primary" type="submit">Submit</Button>
                <Button variant="primary" type="button" onClick={() => {
                    handleDownloadAll({
                        startDate: convertToISO(startDate),
                        endDate: convertToISO(endDate),
                        searchQuery: searchQuery,
                        from: from,
                        clientAgreed: clientAgreed,
                    })
                }} className='ms-2'>Download All</Button>
            </div>
            }
        </Form>
    );
};

function extractAgreementFormDataFieldsAndStripThem(originalObj) {
    const newObj = {};
    for (const key in originalObj) {
        if (originalObj.hasOwnProperty(key)) {
            if (key.startsWith('agreementFormData_')) {
                const newKey = key.replace('agreementFormData_', '');
                newObj[newKey] = originalObj[key];
            } else {
                newObj[key] = originalObj[key];
            }
        }
    }
    return newObj;
  }

const Search = () => {
  const [emails, setEmails] = useState([]);
  const [page, setPage] = useState(1);
  const [formData, setFormData] = useState({})
  const [searchInProgress, setSearchInProgress] = useState(false);
  const [alertData, setAlertData] = useState({}); 

  const handleSearch = async (searchData, page, limit) => {
    try {
        setSearchInProgress(true);
        const emails = await getSearch({...searchData, page, limit});
        setEmails(emails);
        setPage(page);
    } catch(error) {
        setAlertData({
            variant: 'danger',
            message: 'Operation unsuccessful, Please try again later.'
        });
    }

    setSearchInProgress(false);
  }

  useEffect(() => {
    handleSearch({
        startDate: '',
        endDate: '',
        searchQuery: '',
        from: false,
        clientAgreed: false,
    }, 1, 10)
  }, [])

  const handleDownloadAll = async (data) => {
    try {
        const zip = await postDownloadThroughSearchQuery(data);

        const url = window.URL.createObjectURL(new Blob([zip]));
        const link = document.createElement('a');
        link.href = url;
        link.download = 'agreementforms.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setAlertData({
            variant:'success',
            message: 'Operation successful.'
        });
    } catch (e) {
        setAlertData({
            variant: 'danger',
            message: 'Operation unsuccessful, Please try again later.'
        });
    }
  }

  const handleEmailDownload = async (id) => {
    try {
        const { data, filename } = await postDownloadThroughId(id);

        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        setAlertData({
            variant:'success',
            message: 'Operation successful.'
        });
    } catch (e) {
        setAlertData({
            variant: 'danger',
            message: 'Operation unsuccessful, Please try again later.'
        });
    }
  }

  const handleEmailDelete = async (id) => {
    try {
        await deleteEmail(id);

        setEmails(emails.filter((email) => email.id !== id));

        setAlertData({
            variant:'success',
            message: 'Operation successful.'
        });
    } catch (e) {
        setAlertData({
            variant: 'danger',
            message: 'Operation unsuccessful, Please try again later.'
        });
    }
  }

  return (
    <Container>
        <MyAlert data={alertData}/>
        <SearchForm 
            searchInProgress={searchInProgress} 
            handleForm={(data) => {
                handleSearch(data, 1, 10);
                setFormData(data);
            }} 
            handleDownloadAll={handleDownloadAll}
        />
        <div className="mb-3" style={{height: '1px', backgroundColor: 'white'}}></div>
        <ListGroup className='mb-3'>
            {emails.map((email, index) => {

                email = extractAgreementFormDataFieldsAndStripThem(email);

                return (
                    <ListGroup.Item style={email.clientAgreed ? {backgroundColor: "#213529"} : {backgroundColor: "#352529"}} key={index}>
                        <div style={{ display: 'flex', gap: '1rem'}}>
                            <div style={{ flexGrow: 3 }}>
                                <p><span style={{color: '#F5E3E7', fontWeight: 'lighter'}}> From: </span>{email.from}</p>
                                <p><span style={{color: '#F5E3E7', fontWeight: 'lighter'}}> To: </span>{(email.to || []).join(', ')}</p>
                                <p><span style={{color: '#F5E3E7', fontWeight: 'lighter'}}> Client Name: </span>{email.ClientName}</p>
                            </div>
                            <div style={{ flexGrow: 1 }}>
                                <Button variant="primary" type="button" onClick={() => handleEmailDownload(email.id)}>Download</Button>
                                <Button variant="danger" type="button" onClick={() => handleEmailDelete(email.id)} className='mb-2'>Delete</Button>
                            </div>
                        </div>
                    </ListGroup.Item>
                )
            })}
        </ListGroup>
        <Pagination>   
            <Pagination.Prev onClick={() => {
                if(page-1 > 0) {
                    handleSearch(formData, page-1, 10);
                }
            }}/>
            <Pagination.Item active>{page}</Pagination.Item>
            <Pagination.Next onClick={async () => {
                if(emails.length >= 10) {
                    handleSearch(formData, page+1, 10);
                }
            }}/>
        </Pagination>
    </Container>
  );
};

export default Search;
