import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, Button, Modal, Form, Input, Select, message } from "antd";
import axios from "axios";
import { useAuth } from "../AuthContext";
import styles from "../pages/campaigns.module.css";
const { Title } = Typography;

const Campaigns = () => {
  const [data, setData] = useState([]);        // Campaign data
  const [loading, setLoading] = useState(true);  // Spinner state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const { user } = useAuth(); // Get the logged-in user's details (including role)
  const token = localStorage.getItem("token"); // Or retrieve from your AuthContext if stored there

  // Fetch campaigns from the GET /campaigns endpoint
  const fetchCampaigns = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `api/campaigns?sort_by=created_at&order=desc&page=${page}&pageSize=${pageSize}`
      );
      const campaigns = response.data.campaigns || [];
      setData(
        campaigns.map((campaign) => ({
          key: campaign.ID,
          ...campaign,
        }))
      );
      // Update pagination—assuming the API returns a total count; otherwise, adjust as needed.
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: response.data.total || campaigns.length,
      }));
    } catch (error) {
      message.error("Error fetching campaigns");
      console.error(error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns(pagination.current, pagination.pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTableChange = (pagination) => {
    fetchCampaigns(pagination.current, pagination.pageSize);
  };

  // Show the modal to create a new campaign
  const handleCreateCampaign = () => {
    setEditingCampaign(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Open the modal with the selected campaign for editing
  const handleEditCampaign = (record) => {
    setEditingCampaign(record);
    form.setFieldsValue({
      title: record.Title || record.title,
      description: record.Description || record.description,
      target_amount: record.TargetAmount || record.target_amount,
      deadline: record.Deadline || record.deadline,
      currency: record.Currency || record.currency,
      category: record.Category || record.category,
      ...(user && user.role === "admin" ? { status: record.Status || record.status } : {}),
    });
    setIsModalVisible(true);
  };

  // Delete the selected campaign
  const handleDeleteCampaign = async (record) => {
    try {
      await axios.delete(`api/campaigns/detail/${record.ID || record.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      message.success("Campaign deleted successfully");
      fetchCampaigns(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Error deleting campaign");
      console.error(error);
    }
  };

  // Handle the modal OK to either create or update a campaign.
  // Convert target_amount to a number before sending to the API.
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        target_amount: Number(values.target_amount),
      };

      if (editingCampaign) {
        // Update campaign via PUT /campaigns/detail/:id
        await axios.put(
          `api/campaigns/detail/${editingCampaign.ID || editingCampaign.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        message.success("Campaign updated successfully");
      } else {
        // Create campaign via POST /campaigns
        await axios.post(`api/campaigns`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        message.success("Campaign created successfully");
      }
      setIsModalVisible(false);
      setEditingCampaign(null);
      fetchCampaigns(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Error saving campaign");
      console.error(error);
    }
  };

  // Define table columns.
  const columns = [
    {
      title: "Title",
      dataIndex: "Title",
      key: "Title",
      sorter: true,
    },
    {
      title: "Description",
      dataIndex: "Description",
      key: "Description",
    },
    {
      title: "Target Amount",
      dataIndex: "TargetAmount",
      key: "TargetAmount",
      sorter: true,
    },
    {
      title: "Current Amount",
      dataIndex: "CurrentAmount",
      key: "CurrentAmount",
      sorter: true,
    },
    {
      title: "Deadline",
      dataIndex: "Deadline",
      key: "Deadline",
    },
    {
      title: "Status",
      dataIndex: "Status",
      key: "Status",
    },
  ];

  // If the user is a campaign creator or admin, add an Actions column.
  if (user && (user.role === "campaign_creator" || user.role === "admin")) {
    columns.push({
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" className={styles["ant-btn"]} onClick={() => handleEditCampaign(record)}>
            Edit
          </Button>
          {/* <Button type="link" danger className={styles["ant-btn"]} onClick={() => handleDeleteCampaign(record)}>
            Delete
          </Button> */}
        </>
      ),
    });
  }

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>My Campaigns</Title>
      {user && (user.role === "campaign_creator" || user.role === "admin") && (
        <Button 
          type="primary" 
          className={styles["ant-btn"]} 
          style={{ marginBottom: "16px" }} 
          onClick={handleCreateCampaign}
        >
          Create Campaign
        </Button>
      )}
      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={data}
          pagination={pagination}
          onChange={handleTableChange}
          bordered
        />
      )}
      <Modal
        title={editingCampaign ? "Edit Campaign" : "Create Campaign"}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please input the campaign title!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please input the description!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="target_amount"
            label="Target Amount"
            rules={[{ required: true, message: "Please input the target amount!" }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: "Please input the deadline!" }]}
          >
            <Input placeholder="YYYY-MM-DDTHH:MM:SSZ" />
          </Form.Item>
          <Form.Item
            name="currency"
            label="Currency"
            rules={[{ required: true, message: "Please input the currency!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: "Please input the category!" }]}
          >
            <Input />
          </Form.Item>
          {user && user.role === "admin" && (
            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select the status!" }]}
            >
              <Select>
                <Select.Option value="pending">Pending</Select.Option>
                <Select.Option value="active">Approved</Select.Option>
                <Select.Option value="inactive">Rejected</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default Campaigns;
