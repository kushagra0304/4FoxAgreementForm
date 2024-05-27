import { useState } from 'react';
import './homepage.css'
import SendMail from '../components/SendMail';
import Search from '../components/Search';

const HomePage = () => {
    const [tab, setTab] = useState('send');

    return (
        <div className="homePage container">
            <div className='myNavbar'>
                <div style={{color: 'black'}} onClick={() => {setTab('search')}} className='searchTab'>
                    Search
                </div>
                <div style={{color: 'black'}} onClick={() => {setTab('send')}} className='sendTab'>
                    Send
                </div>
            </div>
            <div className='tab'>
                {tab === 'send' ? <SendMail/> : <Search/>}
            </div>
        </div>
    )
};

export default HomePage;
