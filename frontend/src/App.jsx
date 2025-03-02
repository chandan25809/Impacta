// import React from "react";
// import { Routes, Route } from "react-router-dom";
// import Home from "./pages/home";
// import About from "./pages/about";
// import Contact from "./pages/Contact";
// import Register from "./pages/register";
// import Login from "./pages/login";
// import Dashboard from "./pages/dashboard";
// import Navbar from "./components/Navbar";


// const App = () => {
//   return (
//     <>
//       {/* <Navbar /> */}
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/about" element={<About />} />
//         <Route path="/contact" element={<Contact />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/login" element={<Login />} /> 
//         <Route path="/dashboard" element={<Dashboard/>} /> 
//       </Routes>
//     </>
//   );
// };

// export default App;

import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import Navbar from "./components/Navbar";

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    if (storedRole) {
      setUserRole(storedRole);
      setIsAuthenticated(true); // ✅ Set user as logged in
    }
  }, []);

  return (
    <>
      <Navbar /> {/* ✅ Navbar is always visible */}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login setUserRole={setUserRole} setIsAuthenticated={setIsAuthenticated} />} />
        
        {/* ✅ Dashboard is only accessible after login */}
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard userRole={userRole} /> : <Navigate to="/login" />} />

        <Route path="/create-campaign" element={<CreateCampaign />} />
      </Routes>
    </>
  );
};

export default App;

