import React from "react";
import { Link } from "react-router-dom";
import { Menu } from "antd";

const Navbar = () => {
  const items = [
    { label: <Link to="/">Home</Link>, key: "home" },
    { label: <Link to="/about">About</Link>, key: "about" },
    { label: <Link to="/contact">Contact</Link>, key: "contact" },
    { label: <Link to="/dashboard">Dashboard</Link>, key: "dashboard" }
  ];

  return (
    <Menu mode="horizontal" items={items} />
  );
};

export default Navbar;