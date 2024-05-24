import axios from "axios";
import * as oauthService from "../services/oauth"

const Login = () => {
    const zohoLogin = async () => {
        const state = (await oauthService.getStateForOAuth()).data;
        const scope = `ZohoMail.messages.CREATE,ZohoMail.accounts.READ`;
        const client_id = `1000.F0A6G9A627OS4T5F1E4FYDNSLIQEZD`;
        const access_type = `offline`;
        let redirect_domain = (await axios.get(`./oauth/redirect_url`)).data;
        const loginUserURL = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${client_id}&response_type=code&access_type=${access_type}&redirect_uri=${redirect_domain}/oauth/callback&prompt=consent&state=${state}`;

        window.location.href = loginUserURL;
    }

    return (
        <>
            <button onClick={zohoLogin}>Login</button>
        </>
    )
}

export default Login;