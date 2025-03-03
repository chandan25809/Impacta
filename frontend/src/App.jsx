import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";
import PublicRoute from "./routes/PublicRoute";
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Register from "./pages/register";
import Login from "./pages/login";
import Dashboard from "./pages/dashboard";
import CreateCampaign from "./pages/CreateCampaign";
import DonationPage from "./pages/donation"
import Navbar from "./components/Navbar";
import CampaignList from './pages/CampaignList';

const App = () => {
  // const [userRole, setUserRole] = useState(null);
  // const [isAuthenticated, setIsAuthenticated] = useState(false);

  // useEffect(() => {
  //   const storedRole = localStorage.getItem("userRole");
  //   if (storedRole) {
  //     setUserRole(storedRole);
  //     setIsAuthenticated(true); // ✅ Set user as logged in
  //   }
  // }, []);

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
            <Route path="/createcampaign" element={<CreateCampaign />} />
          </Route>
        </Routes>
      </>
  );
};

export default App;
