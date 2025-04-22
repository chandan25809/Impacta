import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";
import SideNav from "./sidenav";

const AppLayout = ({ userRole }) => {
  return (
    <Layout>
      <SideNav userRole={userRole} />
      <Layout style={{ marginLeft: 250 }}>
        <Outlet />
      </Layout>
    </Layout>
  );
};

export default AppLayout;