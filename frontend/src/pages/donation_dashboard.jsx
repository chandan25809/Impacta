import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Table,
  Typography,
  Spin,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  Select,
  message
} from "antd";
import axios from "axios";
import { useAuth } from "../AuthContext";

const { Title } = Typography;
const { Option } = Select;

const DonationDashboard = () => {
  const { campaignId } = useParams(); // For non-admin users, expect URL like /donation/:campaignId
  const { user } = useAuth();
  const token = localStorage.getItem("token");

  // State for listing donations
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // State for donation creation form
  const [form] = Form.useForm();

  // State for admin editing of a donation
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [editForm] = Form.useForm();

  // Fetch donations: if admin, use /user/donations; otherwise, use campaign-specific endpoint.
  const fetchDonations = async () => {
    setLoading(true);
    try {
      let response;

        // Admin: list all donations using /user/donations endpoint
        response = await axios.get("api/user/donations", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });

      const donationList = response.data.donations || [];
      // Map donations and set the unique key
      setDonations(
        donationList.map((donation) => ({
          ...donation,
          key: donation.ID // Assuming the API returns "ID" as the unique identifier
        }))
      );
    } catch (error) {
      message.error("Error fetching donations");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDonations();
  }, [campaignId, user]);

  // Handle donation creation form submission
  const handleDonationSubmit = async (values) => {
    const payload = {
      ...values,
      campaign_id: campaignId,
      amount: Number(values.amount),
      is_anonymous: values.is_anonymous || false
    };

    try {
      await axios.post(`api/donations`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      message.success("Donation successful");
      form.resetFields();
      fetchDonations();
    } catch (error) {
      message.error("Error making donation");
      console.error(error);
    }
  };

  // Admin: Open modal to edit a donation
  const handleEditDonation = (donation) => {
    setEditingDonation(donation);
    editForm.setFieldsValue({
      amount: donation.Amount,
      currency: donation.Currency,
      message: donation.Message,
      is_anonymous: donation.IsAnonymous
    });
    setIsEditModalVisible(true);
  };

  // Admin: Submit the edit donation form
  const handleEditSubmit = async () => {
    try {
      const values = await editForm.validateFields();
      const payload = {
        ...values,
        amount: Number(values.amount)
      };
      // Update donation via PUT /donations/:id
      await axios.put(`api/donations/${editingDonation.ID}`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      message.success("Donation updated successfully");
      setIsEditModalVisible(false);
      setEditingDonation(null);
      fetchDonations();
    } catch (error) {
      message.error("Error updating donation");
      console.error(error);
    }
  };

  // Define table columns mapping the API response.
  // Note: Using the response keys ("ID", "Amount", "Currency", etc.) as provided.
  const columns = [
    {
      title: "Donor Name",
      key: "donorName",
      render: (text, record) => {
        const name = record.Donor?.FullName?.trim() || record.donor_name || "N/A";
        return name;
      }
    },
    {
      title: "Email",
      key: "donorEmail",
      render: (text, record) => {
        const email = record.Donor?.Email?.trim() || record.email || "N/A";
        return email;
      }
    },
    {
      title: "Amount",
      dataIndex: "Amount",
      key: "amount"
    },
    {
      title: "Currency",
      dataIndex: "Currency",
      key: "currency"
    },
    {
      title: "Message",
      dataIndex: "Message",
      key: "message"
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "status"
    },
    {
      title: "Date",
      dataIndex: "CreatedAt",
      key: "createdAt"
    }
  ];
  

  // If user is admin, add an Actions column for editing donation
  if (user && user.role === "admin") {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button type="link" onClick={() => handleEditDonation(record)}>
          Edit
        </Button>
      )
    });
  }

  return (
    <div style={{ padding: "24px" }}>
      {/* For regular users, show the donation form */}
      {!(user && user.role === "admin") && (
        <>
          <Title level={3}>Make a Donation</Title>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleDonationSubmit}
            style={{ maxWidth: "400px", marginBottom: "24px" }}
          >
            <Form.Item
              name="amount"
              label="Amount"
              rules={[{ required: true, message: "Please enter an amount" }]}
            >
              <Input type="number" />
            </Form.Item>
            <Form.Item
              name="currency"
              label="Currency"
              initialValue="USD"
              rules={[{ required: true, message: "Please select a currency" }]}
            >
              <Select>
                <Option value="USD">USD</Option>
                <Option value="EUR">EUR</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="message"
              label="Message"
              rules={[{ required: true, message: "Please enter a message" }]}
            >
              <Input.TextArea />
            </Form.Item>
            <Form.Item name="is_anonymous" valuePropName="checked">
              <Checkbox>Donate anonymously</Checkbox>
            </Form.Item>
            <Form.Item
              name="donor_name"
              label="Your Name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[{ required: true, message: "Please enter your email" }]}
            >
              <Input type="email" />
            </Form.Item>
            <Button type="primary" htmlType="submit">
              Donate
            </Button>
          </Form>
        </>
      )}

      <Title level={3}>
        {user && user.role === "admin" ? "All Donations" : "Campaign Donations"}
      </Title>
      {loading ? (
        <Spin />
      ) : (
        <Table dataSource={donations} columns={columns} rowKey="ID" bordered />
      )}

      {/* Modal for admin donation update */}
      <Modal
        title="Edit Donation"
        visible={isEditModalVisible}
        onOk={handleEditSubmit}
        onCancel={() => {
          setIsEditModalVisible(false);
          setEditingDonation(null);
        }}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            name="amount"
            label="Amount"
            rules={[{ required: true, message: "Please enter an amount" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: "Please select a currency" }]}
          >
            <Select>
              <Option value="USD">USD</Option>
              <Option value="EUR">EUR</Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="message"
            label="Message"
            rules={[{ required: true, message: "Please enter a message" }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item name="is_anonymous" valuePropName="checked">
            <Checkbox>Donate anonymously</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DonationDashboard;
