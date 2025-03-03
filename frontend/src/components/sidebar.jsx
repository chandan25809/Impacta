import React, { useState } from "react";
import { Drawer, Tabs, Table, Badge, Button } from "antd";
import { BellOutlined } from "@ant-design/icons";

const { TabPane } = Tabs;

const Sidebar = () => {
  const [visible, setVisible] = useState(false);

  // 🔥 Store Notifications in State
  const [notifications, setNotifications] = useState([
    { key: "1", message: "You received a $100 donation!", status: "Unread" },
    { key: "2", message: "Campaign 'Wildlife Protection' approved!", status: "Unread" },
    { key: "3", message: "Milestone reached: 50% of the goal!", status: "Read" },
  ]);

  // 🔥 Recent Donations (Show only last 5)
  const allDonations = [
    { key: "1", donor: "John Doe", amount: "$100", campaign: "Education for All" },
    { key: "2", donor: "Jane Smith", amount: "$50", campaign: "COVID-19 Relief" },
    { key: "3", donor: "Alex Brown", amount: "$75", campaign: "Wildlife Protection" },
    { key: "4", donor: "Emma Wilson", amount: "$150", campaign: "Medical Aid Fund" },
    { key: "5", donor: "Michael Lee", amount: "$20", campaign: "Animal Shelter Support" },
    { key: "6", donor: "Sophia Davis", amount: "$200", campaign: "Scholarship Program" },
  ];
  const recentDonations = allDonations.slice(-5); // ✅ Show only last 5 donations

  const showDrawer = () => setVisible(true);
  const closeDrawer = () => setVisible(false);

  // 🔥 Mark Notification as Read
  const markAsRead = (key) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif.key === key ? { ...notif, status: "Read" } : notif
      )
    );
  };

  // 📌 Table Columns
  const notificationColumns = [
    {
      title: "Message",
      dataIndex: "message",
      key: "message",
      render: (text, record) => (
        <span
          onClick={() => markAsRead(record.key)} // ✅ Click to mark as read
          style={{ cursor: "pointer", fontWeight: record.status === "Unread" ? "bold" : "normal" }}
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

  const donationColumns = [
    { title: "Donor", dataIndex: "donor", key: "donor" },
    { title: "Amount", dataIndex: "amount", key: "amount" },
    { title: "Campaign", dataIndex: "campaign", key: "campaign" },
  ];

  return (
    <>
      {/* 🔔 Bell Icon for Notifications */}
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

      {/* 📌 Sidebar Drawer */}
      <Drawer title="Activity Panel" placement="right" closable onClose={closeDrawer} open={visible} width={400}>
        <Tabs defaultActiveKey="1">
          {/* 🔔 Notifications Tab */}
          <TabPane tab="🔔 Notifications" key="1">
            <Table dataSource={notifications} columns={notificationColumns} pagination={false} />
          </TabPane>

          {/* 💰 Recent Donations Tab */}
          <TabPane tab="💰 Recent Donations" key="2">
            <Table dataSource={recentDonations} columns={donationColumns} pagination={false} />
            <Button type="link" onClick={() => console.log("Redirect to full donations page")}>
              View All Donations →
            </Button>
          </TabPane>
        </Tabs>
      </Drawer>
    </>
  );
};

export default Sidebar;
