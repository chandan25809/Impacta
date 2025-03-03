import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Home from "./pages/home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import DonationPage from "./pages/donation";
import Navbar from "./components/Navbar";


const App = () => {
  return (
      <>
        {/* <Navbar /> */}

        <Routes>
          {/* Public Routes */}
          <Route element={<PublicRoute />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/donation/:campaignId" element={<DonationPage />} />
            </Route>

          {/* Private Routes - Only Accessible to Authenticated Users */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </>
  );
};

export default App;
