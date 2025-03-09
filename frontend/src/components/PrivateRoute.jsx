import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  // Check if user is logged in
  const token = localStorage.getItem('token');
  
  // If not authenticated, redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;