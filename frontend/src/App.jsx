import { useEffect, useState } from 'react'
import './App.css'
import { getCheckJWT } from './services/oauth';
import Login from './pages/Login';
import Homepage from './pages/Homepage';

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(true);

  useEffect(() => {
    getCheckJWT().then((bool) => {
      if(bool) {
        setUserLoggedIn(true)
      }
    })
  }, [])

  return (
    <>
      {userLoggedIn ? <Homepage/> : <Login/>}
    </>
  )
}

export default App
