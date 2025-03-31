import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import SideNav from "./sidenav";
import "./dashboard.module.css"; // Ensure dashboard styles are applied

const { Content } = Layout;

const AppLayout = () => {
  return (
    <Layout>
      {/* Persistent sidebar */}
      <SideNav />
      {/* Content area offset by the sidebar's width */}
      <Layout style={{ marginLeft: 250 }}>
        <Content style={{ padding: "20px", minHeight: "100vh" }}>
          {/* This Outlet renders the nested route content */}
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
