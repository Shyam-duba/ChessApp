import React from 'react'
import Home from './pages/Home'
import Login from './components/Login'
import Signup from './components/Register'
import NotFound from './pages/NotFound'
import Game from './pages/Game'
import PrivateRoute from './components/PrivateRoute'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
// import "aceternity-ui/styles.css";


export default function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Protected routes */}
        <Route 
          path="/" 
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/game/:roomId" 
          element={
            <PrivateRoute>
              <Game />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/play/ai" 
          element={
            <PrivateRoute>
              {/* AI Game component would go here */}
              <div>AI Game - To be implemented</div>
            </PrivateRoute>
          } 
        />
        
        {/* Redirect any unknown paths to home */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
    </div>
  )
}
