// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import PublicRoute from "./routes/PrivateRoute";   
// import PrivateRoute from "./routes/PublicRoute"; 
// import Home from "./pages/home";
// import About from "./pages/about";
// import Contact from "./pages/contact";
// import Register from "./pages/register";
// import Login from "./pages/login";
// import Dashboard from "./pages/dashboard";
// import DonationPage from "./pages/donation";
// import CreateCampaign from "./pages/CreateCampaign";

// const App = () => {
//   return (
//     <>
//       <Routes>
//         {/* Public Routes */}
//         <Route element={<PublicRoute />}>
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/register" element={<Register />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="/donation/:campaignId" element={<DonationPage />} />
//           {/* Remove createcampaign from public if you want it private only */}
//         </Route>

//         {/* Private Routes */}
//         <Route element={<PrivateRoute />}>
//           <Route path="/dashboard" element={<Dashboard />} />
//           <Route path="/createcampaign" element={<CreateCampaign />} />
//         </Route>
//       </Routes>
//     </>
//   );
// };

// export default App;

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PublicRoute from "./routes/PublicRoute";
import About from "./pages/about";
import Contact from "./pages/contact";
import Register from "./pages/register";
import Login from "./pages/login";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DonationPage from "./pages/donation";
import CreateCampaign from "./pages/CreateCampaign";
import Navbar from "./components/Navbar";

const App = () => (
  <>
    <Navbar />
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/" element={<AnalyticsDashboard />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/donation/:campaignId" element={<DonationPage />} />
      </Route>

      {/* Private Routes */}
      {/* Add private routes if needed */}
      <Route path="/createcampaign" element={<CreateCampaign />} />
    </Routes>
  </>
);

export default App;

