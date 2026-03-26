import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
  const userRole = localStorage.getItem('userRole');

  // If no role is set, or the role doesn't match, redirect to Home
  if (!userRole || userRole !== requiredRole) {
    alert("Access Denied: Please login as a Current Student to access this area.");
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;