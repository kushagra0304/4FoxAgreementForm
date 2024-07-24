import { useState } from 'react';
import './homepage.css'
import SendMail from '../components/SendMail';
import Search from '../components/Search';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { getLogout } from '../services/oauth';
import Settings from '../components/Settings';
import * as accessService from '../services/access';

const HomePage = () => {
    const [tab, setTab] = useState('send');
    const [showModal, setShowModal] = useState(false);
    const handleModalClose = () => setShowModal(false);
    const handleModalShow = () => setShowModal(true);
    const [access, setAccess] = useState(false);

    useState(() => {
        (async () => {
            if((await accessService.getHrAccess()) || (await accessService.getOwnerAccess())) {
                setAccess(true);
            }
        })()
    }, [])

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
                { access &&
                <div onClick={() => {setTab('settings')}} className='sendTab baseStyleTab'>
                    <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }} viewBox="0 0 32 32">
                        <path d="M 13.1875 3 L 13.03125 3.8125 L 12.4375 6.78125 C 11.484375 7.15625 10.625 7.683594 9.84375 8.3125 L 6.9375 7.3125 L 6.15625 7.0625 L 5.75 7.78125 L 3.75 11.21875 L 3.34375 11.9375 L 3.9375 12.46875 L 6.1875 14.4375 C 6.105469 14.949219 6 15.460938 6 16 C 6 16.539063 6.105469 17.050781 6.1875 17.5625 L 3.9375 19.53125 L 3.34375 20.0625 L 3.75 20.78125 L 5.75 24.21875 L 6.15625 24.9375 L 6.9375 24.6875 L 9.84375 23.6875 C 10.625 24.316406 11.484375 24.84375 12.4375 25.21875 L 13.03125 28.1875 L 13.1875 29 L 18.8125 29 L 18.96875 28.1875 L 19.5625 25.21875 C 20.515625 24.84375 21.375 24.316406 22.15625 23.6875 L 25.0625 24.6875 L 25.84375 24.9375 L 26.25 24.21875 L 28.25 20.78125 L 28.65625 20.0625 L 28.0625 19.53125 L 25.8125 17.5625 C 25.894531 17.050781 26 16.539063 26 16 C 26 15.460938 25.894531 14.949219 25.8125 14.4375 L 28.0625 12.46875 L 28.65625 11.9375 L 28.25 11.21875 L 26.25 7.78125 L 25.84375 7.0625 L 25.0625 7.3125 L 22.15625 8.3125 C 21.375 7.683594 20.515625 7.15625 19.5625 6.78125 L 18.96875 3.8125 L 18.8125 3 Z M 14.8125 5 L 17.1875 5 L 17.6875 7.59375 L 17.8125 8.1875 L 18.375 8.375 C 19.511719 8.730469 20.542969 9.332031 21.40625 10.125 L 21.84375 10.53125 L 22.40625 10.34375 L 24.9375 9.46875 L 26.125 11.5 L 24.125 13.28125 L 23.65625 13.65625 L 23.8125 14.25 C 23.941406 14.820313 24 15.402344 24 16 C 24 16.597656 23.941406 17.179688 23.8125 17.75 L 23.6875 18.34375 L 24.125 18.71875 L 26.125 20.5 L 24.9375 22.53125 L 22.40625 21.65625 L 21.84375 21.46875 L 21.40625 21.875 C 20.542969 22.667969 19.511719 23.269531 18.375 23.625 L 17.8125 23.8125 L 17.6875 24.40625 L 17.1875 27 L 14.8125 27 L 14.3125 24.40625 L 14.1875 23.8125 L 13.625 23.625 C 12.488281 23.269531 11.457031 22.667969 10.59375 21.875 L 10.15625 21.46875 L 9.59375 21.65625 L 7.0625 22.53125 L 5.875 20.5 L 7.875 18.71875 L 8.34375 18.34375 L 8.1875 17.75 C 8.058594 17.179688 8 16.597656 8 16 C 8 15.402344 8.058594 14.820313 8.1875 14.25 L 8.34375 13.65625 L 7.875 13.28125 L 5.875 11.5 L 7.0625 9.46875 L 9.59375 10.34375 L 10.15625 10.53125 L 10.59375 10.125 C 11.457031 9.332031 12.488281 8.730469 13.625 8.375 L 14.1875 8.1875 L 14.3125 7.59375 Z M 16 11 C 13.25 11 11 13.25 11 16 C 11 18.75 13.25 21 16 21 C 18.75 21 21 18.75 21 16 C 21 13.25 18.75 11 16 11 Z M 16 13 C 17.667969 13 19 14.332031 19 16 C 19 17.667969 17.667969 19 16 19 C 14.332031 19 13 17.667969 13 16 C 13 14.332031 14.332031 13 16 13 Z"></path>
                    </svg>               
                </div>
                }
                <div onClick={handleModalShow} className='logoutTab baseStyleTab'>
                    <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
                        <path fill="#000000" d="M352 159.872V230.4a352 352 0 1 0 320 0v-70.528A416.128 416.128 0 0 1 512 960a416 416 0 0 1-160-800.128z"/>
                        <path fill="#000000" d="M512 64q32 0 32 32v320q0 32-32 32t-32-32V96q0-32 32-32z"/>
                    </svg>
                </div>
            </div>
            <div className='tab' style={{ marginTop: "8rem", marginBottom: "8rem" }}>
                {tab === 'send' ? <SendMail/> : <></>}
                {tab === 'search' ? <Search/> : <></>}
                {tab === 'settings' ? <Settings/> : <></>}
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
