import React from "react";
import { useNavigate } from "react-router-dom"; // ✅ Import for navigation
import { Card, Col, Row, Typography, Button } from "antd";
import { HomeOutlined, LogoutOutlined, PlusCircleOutlined } from "@ant-design/icons";
import styles from "../pages/dashboard.module.css"; // ✅ CSS Module Import
import { Link } from "react-router-dom";

const { Title, Text } = Typography;

// Sample Campaign Data
const campaigns = [
  { id: 1, name: "COVID-19 Relief", amount: "$10,000 / $15,000", status: "Active" },
  { id: 2, name: "Education for All", amount: "$5,500 / $10,000", status: "Pending" },
  { id: 3, name: "Wildlife Protection", amount: "$3,200 / $5,000", status: "Completed" },
];

// Sample Statistics
const stats = {
  totalCampaigns: 15,
  activeCampaigns: 5,
  totalFundsRaised: "$50,000+",
};

const Dashboard = () => {
  const navigate = useNavigate(); // ✅ Hook for navigation

  // ✅ Logout Function
  const handleLogout = () => {
    localStorage.removeItem("token"); 
    localStorage.removeItem("userRole"); 
    navigate("/login"); 
  };

  return (
    <div className={styles["dashboard-container"]}>
      
      {/* ✅ Home & Logout Buttons */}
      <div className={styles["nav-buttons"]}>
      <Button type="text" icon={<HomeOutlined />} onClick={() => navigate("/")}>
        Home
      </Button>
        <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>
          Logout
        </Button>
      </div>

      {/* Greeting Message */}
      <Title level={2} className={styles["welcome-text"]}>
        Welcome Back, Campaign Creator! 🎉
      </Title>
      <Text className={styles["dashboard-subtitle"]}>
        Here's an overview of your campaigns.
      </Text>

      {/* 📊 Campaign Statistics Section */}
      <div className={styles["stats-container"]}>
        <Card className={styles["stats-card"]}>
          <Text className={styles["stats-label"]}>Total Campaigns</Text>
          <Title level={3} className={styles["stats-value"]}>{stats.totalCampaigns}</Title>
        </Card>
        <Card className={styles["stats-card"]}>
          <Text className={styles["stats-label"]}>Active Campaigns</Text>
          <Title level={3} className={styles["stats-value"]}>{stats.activeCampaigns}</Title>
        </Card>
        <Card className={styles["stats-card"]}>
          <Text className={styles["stats-label"]}>Total Funds Raised</Text>
          <Title level={3} className={styles["stats-value"]}>{stats.totalFundsRaised}</Title>
        </Card>
      </div>

      {/* 📍 Campaign Cards */}
      <div className={styles["campaign-cards"]}>
        <Row gutter={[24, 24]} justify="center">
          {campaigns.map((campaign) => (
            <Col key={campaign.id} xs={24} sm={12} md={8} lg={8}>
              <Card className={styles["donation-card"]}>
                <Title level={4} className={styles["donation-name"]}>{campaign.name}</Title>

                <div className={styles["funds-raised"]}>
                  <Text className={styles["donation-label"]}>Funds Raised:</Text>
                  <Text className={styles["donation-amount"]}>{campaign.amount}</Text>
                </div>

                <div className={styles["status-container"]}>
                  <Text className={styles["donation-label"]}>Status:</Text>
                  <span className={`${styles["campaign-status"]} ${
                    campaign.status === "Active" ? styles["status-active"] :
                    campaign.status === "Pending" ? styles["status-pending"] :
                    styles["status-completed"]
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                {/* Buttons */}
                <div className={styles["button-group"]}>
                  <button className={styles["manage-btn"]}>Manage</button>
                  <button className={styles["analytics-btn"]}>View Analytics</button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* 📝 Floating "Create Campaign" Button */}
      <Link to="/createcampaign">
        <Button className={styles["create-campaign-btn"]} type="primary" icon={<PlusCircleOutlined />}>
          Create Campaign
        </Button>
      </Link>
    </div>
  );
};

export default Dashboard;
