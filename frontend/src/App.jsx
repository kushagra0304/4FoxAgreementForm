import { useState } from 'react'
import './App.css'

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submitForm = (event) => {
    event.preventDefault();

    const scope = `ZohoMail.messages.CREATE`;
    const client_id = `1000.YV31DC9CODX4PYC0C5YPRWX5WNR0MB`;
    const access_type = `offline`;
    const redirect_uri = `https://fourfoxagreementform.onrender.com/oauth2callback`;

    const loginUserURL = `https://accounts.zoho.com/oauth/v2/auth?scope=${scope}&client_id=${client_id}&response_type=code&access_type=${access_type}&redirect_uri=${redirect_uri}&prompt=consent`;

    window.location.href = loginUserURL;
  }

  return (
    <>
      <form onSubmit={submitForm}>
        <div className="field">
              <label htmlFor="userEmail" className="label">Email</label>
              <div className="control">
                <input value={email} onChange={(value) => setEmail(value)} id="userEmail" className="input" type="text"></input>
              </div>
          </div>  
          <div className="field">
              <label htmlFor="userPassword" className="label">Password</label>
              <div className="control">
                <input value={password} onChange={(value) => setPassword(value)} id="userPassword" className="input" type="password"></input>
              </div>
          </div>  
          <button className='button is-link' type='submit'>Login</button>
      </form>
    </>
  )
}

export default App
