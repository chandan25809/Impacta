import React from "react";
import { Card, Col, Row, Typography } from "antd";
import styles from "../pages/Dashboard.module.css"; // ✅ Correct CSS Module Import

const { Title, Text } = Typography;

// Sample donation data (replace with actual data from API)
const donations = [
  { id: 1, name: "COVID-19 Relief Fund", amount: "$500", beneficiary: "Red Cross", link: "#" },
  { id: 2, name: "Children's Education Support", amount: "$200", beneficiary: "UNICEF", link: "#" },
  { id: 3, name: "Wildlife Conservation", amount: "$150", beneficiary: "WWF", link: "#" },
  { id: 4, name: "Food for the Homeless", amount: "$100", beneficiary: "Local Shelter", link: "#" },
  { id: 5, name: "Medical Aid for Refugees", amount: "$250", beneficiary: "Doctors Without Borders", link: "#" },
];

const Dashboard = () => {
  return (
    <div className={styles["dashboard-container"]}>
      {/* Greeting Message */}
      <Title level={2} className={styles["dashboard-title"]}>
        Hello Donor, Look at Your Donations
      </Title>

      {/* Spacing between title and cards */}
      <div className={styles["dashboard-space"]}></div>

      {/* Grid Layout for Donations */}
      <Row gutter={[24, 24]} justify="center">
        {donations.map((donation) => (
          <Col key={donation.id} xs={24} sm={12} md={8} lg={6}>
            <Card className={styles["donation-card"]}>
              <Title level={4} className={styles["donation-name"]}>{donation.name}</Title>

              <Text className={styles["donation-label"]}>Your Contribution:</Text>
              <Text className={styles["donation-amount"]}>{donation.amount}</Text>

              <Text className={styles["donation-label"]}>Beneficiary:</Text>
              <Text className={styles["donation-beneficiary"]}>{donation.beneficiary}</Text>

              {/* View More inside the card and in yellow color */}
              <div className={styles["view-more-container"]}>
                <a href={donation.link} className={styles["view-more"]}>
                  View Campaign
                </a>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Dashboard;
