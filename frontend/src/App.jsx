import React from 'react'
import Home from './pages/Home'
import Login from './components/Login'
import Signup from './components/Register'
import NotFound from './pages/NotFound'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
// import "aceternity-ui/styles.css";


export default function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="*" element={<NotFound />}></Route>
      </Routes>
      </BrowserRouter>
    </div>
  )
}
