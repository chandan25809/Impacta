// src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Drawer, Tabs, Table, Badge, Button, Spin } from "antd";
import { BellOutlined } from "@ant-design/icons";
import axios from "axios";

const { TabPane } = Tabs;

const Sidebar = () => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications from API on component mount
  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Retrieve user id and token from localStorage (ensure these are set at login)
        const user_id = localStorage.getItem("user_id");
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:8080/notifications?user_id=${user_id}`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
            },
          }
        );
        // Assuming API returns { notifications: [ {ID, UserID, Content, Status, ...} ] }
        const fetchedNotifications = response.data.notifications.map(n => ({
          key: n.ID,
          message: n.Content,
          // Capitalize first letter for display; assuming API returns "unread"
          status: n.Status.charAt(0).toUpperCase() + n.Status.slice(1),
        }));
        setNotifications(fetchedNotifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  // Dummy Recent Donations Data (could be replaced with an API call later)
  const allDonations = [
    { key: "1", donor: "John Doe", amount: "$100", campaign: "Education for All" },
    { key: "2", donor: "Jane Smith", amount: "$50", campaign: "COVID-19 Relief" },
    { key: "3", donor: "Alex Brown", amount: "$75", campaign: "Wildlife Protection" },
    { key: "4", donor: "Emma Wilson", amount: "$150", campaign: "Medical Aid Fund" },
    { key: "5", donor: "Michael Lee", amount: "$20", campaign: "Animal Shelter Support" },
    { key: "6", donor: "Sophia Davis", amount: "$200", campaign: "Scholarship Program" },
  ];
  const recentDonations = allDonations.slice(-5); // Last 5 donations

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  // Mark a notification as read
  const markAsRead = (key) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.key === key ? { ...notif, status: "Read" } : notif
      )
    );
  };

  // Columns for notifications table
  const notificationColumns = [
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text, record) => (
        <span
          onClick={() => markAsRead(record.key)}
          style={{
            cursor: "pointer",
            fontWeight: record.status === "Unread" ? "bold" : "normal",
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) =>
        status === "Unread" ? (
          <Badge status="processing" text="Unread" />
        ) : (
          <Badge status="default" text="Read" />
        ),
    },
  ];

  // Columns for recent donations table
  const donationColumns = [
    { title: "Donor", dataIndex: "donor", key: "donor" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Campaign", dataIndex: "campaign", key: "campaign" },
  ];

  return (
    <>
      {/* Bell Icon for Notifications */}
      <Button
        type="text"
        icon={<BellOutlined style={{ fontSize: "18px", color: "white" }} />}
        onClick={showDrawer}
        style={{
          background: "transparent",
          border: "none",
          boxShadow: "none",
        }}
      >
        <Badge count={notifications.filter((n) => n.status === "Unread").length} />
      </Button>

      {/* Sidebar Drawer */}
      <Drawer
        title="Activity Panel"
        placement="right"
        closable
        onClose={closeDrawer}
        open={visible}
        width={400}
      >
        <Tabs defaultActiveKey="1">
          {/* Notifications Tab */}
          <TabPane tab="🔔 Notifications" key="1">
            {loading ? (
              <Spin tip="Loading notifications..." />
            ) : (
              <Table
                dataSource={notifications}
                columns={notificationColumns}
                pagination={false}
              />
            )}
          </TabPane>

          {/* Recent Donations Tab */}
          <TabPane tab="💰 Recent Donations" key="2">
            <Table
              dataSource={recentDonations}
              columns={donationColumns}
              pagination={false}
            />
            <Button
              type="link"
              onClick={() => console.log("Redirect to full donations page")}
            >
              View All Donations →
            </Button>
          </TabPane>
        </Tabs>
      </Drawer>
    </>
  );
};

export default Sidebar;
