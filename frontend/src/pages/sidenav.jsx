import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FundOutlined,
  BarChartOutlined,
  SettingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import styles from "./SideNav.module.css";

const { Sider } = Layout;

const SideNav = () => {
  return (
    <Sider className={styles.sider} width={250}>
      <div className={styles.logo}>
        <Link to="/dashboard" style={{ color: "#000", textDecoration: "none" }}>
          Impacta
        </Link>
      </div>
      <Menu theme="light" mode="inline" defaultSelectedKeys={["dashboard"]}>
        <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
          <Link to="/dashboard">Dashboard</Link>
        </Menu.Item>
        <Menu.Item key="campaigns" icon={<FundOutlined />}>
          <Link to="/createcampaign">Campaigns</Link>
        </Menu.Item>
        <Menu.Item key="analytics" icon={<BarChartOutlined />}>
          <Link to="/analytics">Analytics</Link>
        </Menu.Item>
        <Menu.Item key="settings" icon={<SettingOutlined />}>
          <Link to="/settings">Settings</Link>
        </Menu.Item>
        <Menu.Item key="profile" icon={<UserOutlined />}>
          <Link to="/profile">Profile</Link>
        </Menu.Item>
      </Menu>
    </Sider>
  );
};

export default SideNav;
