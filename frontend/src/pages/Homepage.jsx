import { useState } from 'react';
import './homepage.css'
import SendMail from '../components/SendMail';
import Search from '../components/Search';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { getLogout } from '../services/oauth';

const HomePage = () => {
    const [tab, setTab] = useState('send');
    const [showModal, setShowModal] = useState(false);
    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);

    return ( 
        <div className="homePage container">
            <div className='myNavbar'>
                <div onClick={() => {setTab('search')}} className='searchTab baseStyleTab'>
                    <svg viewBox="0 0 24 24" fill='none' xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                        <path d="M15.7955 15.8111L21 21M18 10.5C18 14.6421 14.6421 18 10.5 18C6.35786 18 3 14.6421 3 10.5C3 6.35786 6.35786 3 10.5 3C14.6421 3 18 6.35786 18 10.5Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </div>
                <div onClick={() => {setTab('send')}} className='sendTab baseStyleTab'>
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                        <path fillRule="evenodd" clipRule="evenodd" d="M3.75 5.25L3 6V18L3.75 18.75H20.25L21 18V6L20.25 5.25H3.75ZM4.5 7.6955V17.25H19.5V7.69525L11.9999 14.5136L4.5 7.6955ZM18.3099 6.75H5.68986L11.9999 12.4864L18.3099 6.75Z" fill="#000000"/>
                    </svg>                
                </div>
                <div onClick={handleModalShow} className='logoutTab baseStyleTab'>
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                        <path fill="#000000" d="M352 159.872V230.4a352 352 0 1 0 320 0v-70.528A416.128 416.128 0 0 1 512 960a416 416 0 0 1-160-800.128z"/>
                        <path fill="#000000" d="M512 64q32 0 32 32v320q0 32-32 32t-32-32V96q0-32 32-32z"/>
                    </svg>
                </div>
            </div>
            <div className='tab'>
                {tab === 'send' ? <SendMail/> : <Search/>}
            </div>
            <div>
                <Modal show={showModal} onHide={handleModalClose}>
                    <Modal.Header>
                        <Modal.Title>Confirm</Modal.Title>
                    </Modal.Header>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleModalClose}>Close</Button>
                        <Button variant="danger" onClick={async () => {
                           const bool = await getLogout();
                           if(bool) { 
                                window.location.href = '/';
                           }
                        }}>Logout</Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    )
};

export default HomePage;
