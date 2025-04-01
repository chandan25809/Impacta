// import React from "react";
//  import { Navigate, Outlet } from "react-router-dom";
 
//  // Mock authentication function
//  const useAuth = () => {
//    const user = localStorage.getItem("token");
//    return !!user;
//  };
 
//  const PublicRoute = () => {
//    return !useAuth() ? <Outlet /> : <Navigate to="/dashboard" replace />;
//  };
 
//  export default PublicRoute;

// src/routes/PublicRoute.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicRoute = () => {
  return <Outlet />;
};

export default PublicRoute;
