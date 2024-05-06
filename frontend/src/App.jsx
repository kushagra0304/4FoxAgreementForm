import { useState } from 'react'
import './App.css'
import Form from './components/Form';
import Login from './components/Login'

const getLoggedUserToken = () => {
  const loggedUserTokenJSON = window.localStorage.getItem('userToken');
  if (loggedUserTokenJSON) {
    return JSON.parse(loggedUserTokenJSON)
  }

  return null
}

function App() {
  const [token, setToken] = useState(getLoggedUserToken())

  // const submitForm = (event) => {
  //   event.preventDefault();

  //   const scope = `ZohoMail.messages.CREATE`;
  //   const client_id = `1000.YV31DC9CODX4PYC0C5YPRWX5WNR0MB`;
  //   const access_type = `offline`;
  //   const redirect_uri = `https://fourfoxagreementform.onrender.com/oauth2callback`;

  //   const loginUserURL = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${client_id}&response_type=code&access_type=${access_type}&redirect_uri=${redirect_uri}&prompt=consent`;

  //   window.location.href = loginUserURL;
  // }

  return (
    <>
      {token ? <Form setToken={setToken}/> : <Login/>}
    </>
  )
}

export default App
