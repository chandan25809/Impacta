import React from "react";
import { Layout, Menu } from "antd";
import {
  DashboardOutlined,
  FundOutlined,
  DollarOutlined,
  FileImageOutlined,
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import styles from "./SideNav.module.css";
import { useAuth } from "../AuthContext"; // adjust path as needed

const { Sider } = Layout;

const SideNav = ({ userRole }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();


  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Sider className={styles.sider} width={250}>
      <div className={styles.logo}>
        <Link to="/analyticsDashboard" style={{ color: "#000", textDecoration: "none" }}>
          Impacta
        </Link>
      </div>
      <div className={styles.menuContainer}>
        <Menu theme="light" mode="inline" defaultSelectedKeys={["dashboard"]}>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/analyticsDashboard">Dashboard</Link>
          </Menu.Item>
          <Menu.Item key="campaigns" icon={<FundOutlined />}>
            <Link to="/campaigns">Campaigns</Link>
          </Menu.Item>
          <Menu.Item key="donations" icon={<DollarOutlined />}>
            <Link to="/donations">Donations</Link>
          </Menu.Item>
          {/* <Menu.Item key="media" icon={<FileImageOutlined />}>
            <Link to="/media">Media Files</Link>
          </Menu.Item> */}
          <Menu.Item key="comments" icon={<MessageOutlined />}>
            <Link to="/comments">Comments</Link>
          </Menu.Item>
          {userRole === "admin" && (
            <Menu.Item key="users" icon={<UserOutlined />}>
              <Link to="/users">Users</Link>
            </Menu.Item>
          )}
        </Menu>
      </div>
      <div className={styles.logoutContainer}>
        <Menu theme="light" mode="inline" selectable={false}>
          <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
            Logout
          </Menu.Item>
        </Menu>
      </div>
    </Sider>
  );
};

export default SideNav;