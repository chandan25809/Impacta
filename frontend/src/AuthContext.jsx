import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("token");

  const logout = () => {
    // Remove the JWT token from local storage
    localStorage.removeItem("token");
    // Reset user state
    setUser(null);
    // Optionally, redirect the user (e.g., to the login page)
    // window.location.href = "/login";
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (token) {
        try {
          const response = await axios.get("api/user", {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });
          // Save user details (including the role) in state
          setUser(response.data.user);
        } catch (error) {
          console.error("Error fetching user details", error);
        }
      }
    };

    fetchUserDetails();
  }, [token]);

  // Add logout to the context value
  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
