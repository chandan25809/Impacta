import React from "react";
import { Navigate, Outlet } from "react-router-dom";

// Mock authentication function (Replace this with actual auth logic)
const useAuth = () => {
  const user = localStorage.getItem("token"); // Fetch token from localStorage
  return !!user; // Returns true if token exists
};

const PrivateRoute = () => {
  return useAuth() ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;