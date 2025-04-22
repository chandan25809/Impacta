import React from "react";
import { Routes, Route } from "react-router-dom";
import PrivateRoute from "./routes/PrivateRoute";   
import PublicRoute from "./routes/PublicRoute"; 
import Home from "./pages/home";
import About from "./pages/about";
import Contact from "./pages/contact";
import Register from "./pages/register";
import Login from "./pages/login";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import DonationPage from "./pages/donation";
import CreateCampaign from "./pages/CreateCampaign";
import DashboardTable from "./pages/table";
import AppLayout from "./pages/appLayout";
import Campaigns from "./pages/Campaigns";
import DonationDashboard from "./pages/donation_dashboard";
import SupportTickets from "./pages/SupportTickets";
import AskQuestion from "./pages/askQuestion";       
import SupportWidget from "./components/SupportWidget";

export default function App() {
  return (
    <>
      {/* If you want the widget globally */}
      <SupportWidget />

      <Routes>
        {/* Public Routes */}
        <Route element={<PublicRoute />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/donation/:campaignId" element={<DonationPage />} />
          <Route path="/table" element={<DashboardTable />} />
          <Route path="/support" element={<SupportTickets />} />
        </Route>

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/support/ask" element={<AskQuestion />} />
          <Route element={<AppLayout />}>
            <Route path="/createcampaign" element={<CreateCampaign />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/donations" element={<DonationDashboard />} />
            <Route path="/analyticsdashboard" element={<AnalyticsDashboard />} />
          </Route>
        </Route>
      </Routes>
      <SupportWidget />
    </>
  );
}
