import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";
import Sidebar from "./Sidebar"; // ✅ Import Sidebar

const Navbar = () => {
  const items = [
    { label: <Link to="/">Home</Link>, key: "home" },
    { label: <Link to="/about">About</Link>, key: "about" },
    { label: <Link to="/contact">Contact</Link>, key: "contact" },
    { label: <Link to="/dashboard">Dashboard</Link>, key: "dashboard" },
    { label: <Sidebar />, key: "notifications" }, // 🔔 Add Sidebar for Notifications
  ];

  return <Menu mode="horizontal" items={items} />;
};

export default Navbar;
