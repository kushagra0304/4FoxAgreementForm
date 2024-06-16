// Functional imports
import * as oauthService from "../services/oauth"
// Style imports
import Alert from 'react-bootstrap/Alert';
import logo from '../assets/zoho-logo-512.png'
import './login.css'
import { useEffect, useState } from "react";

const Login = () => {
    const [showAlert, setShowAlert] = useState(false);

    useEffect(() => {
        const handle = setInterval(() => {
            setShowAlert(false);
        }, 5000);
        
        return () => {
            clearInterval(handle);
        };
    }, [showAlert])

    const zohoLogin = async () => {
        try {
            const state = await oauthService.getStateForOAuth();
            const scope = `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`;
            const client_id = `1000.F0A6G9A627OS4T5F1E4FYDNSLIQEZD`;
            const access_type = `offline`;
            let redirect_domain = await oauthService.getRedirectURL();
            const loginUserURL = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${client_id}&response_type=code&access_type=${access_type}&redirect_uri=${redirect_domain}/oauth/callback&prompt=consent&state=${state}`;
            window.location.href = loginUserURL;
        } catch(error) {
            setShowAlert(true);
        }
    } 

    return (
        <>
            <div className="loginPage container">
                <Alert variant="danger" show={showAlert}>Some error occured, please try again later</Alert>
                <div className="loginCard">
                    <div>
                        <h1>Hello <span style={{color: "tomato"}}>4Foxian</span>!</h1>
                        <h2>Sign in using your ZOHO account</h2>
                        <div onClick={zohoLogin} className="logoBox">
                            <img src={logo} alt="" />
                        </div>
                    </div>
                    <div></div>
                </div>
            </div>
        </>
    )
}

export default Login;