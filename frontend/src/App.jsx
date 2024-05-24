import { useEffect, useState } from 'react'
import './App.css'
import Form from './components/Form';
import Login from './components/Login'
import { getCheckJWT } from './services/oauth';

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);

  useEffect(() => {
    getCheckJWT().then((bool) => {
      if(bool) {
        setUserLoggedIn(true)
      }
    })
  }, [])

  return (
    <>
      {userLoggedIn ? <Form/> : <Login/>}
    </>
  )
}

export default App
