import React, { useEffect, useState, useMemo } from "react";
import { Table, Typography, Spin, Button, Modal, Form, Input, Select, message, Space } from "antd";
import axios from "axios";
import { useAuth } from "../AuthContext";
import styles from "../pages/campaigns.module.css";
const { Title } = Typography;
const { Option } = Select;

const Campaigns = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 5, total: 0 });
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // filters
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(undefined);
  const [statusFilter, setStatusFilter] = useState(undefined);

  const { user } = useAuth();
  const token = localStorage.getItem("token");

  const fetchCampaigns = async (page = 1, pageSize = 5) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `api/campaigns?sort_by=created_at&order=desc&page=${page}&pageSize=${pageSize}`
      );
      const campaigns = response.data.campaigns || [];
      setData(
        campaigns.map((campaign) => ({ key: campaign.ID, ...campaign }))
      );
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

  const handleTableChange = (pg) => {
    fetchCampaigns(pg.current, pg.pageSize);
  };

  // derive unique categories
  const categoryOptions = useMemo(() => {
    const cats = Array.from(new Set(data.map((c) => c.Category)));
    return cats.map((c) => ({ value: c, label: c }));
  }, [data]);

  // filtered data
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchText =
        item.Title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Description.toLowerCase().includes(searchText.toLowerCase());
      const matchCategory = categoryFilter ? item.Category === categoryFilter : true;
      const matchStatus = statusFilter ? item.Status === statusFilter : true;
      return matchText && matchCategory && matchStatus;
    });
  }, [data, searchText, categoryFilter, statusFilter]);

  // ----- Create / Edit handlers omitted for brevity (same as before) -----

  const handleCreateCampaign = () => { setEditingCampaign(null); form.resetFields(); setIsModalVisible(true); };
  const handleEditCampaign = (record) => {
    setEditingCampaign(record);
    form.setFieldsValue({
      title: record.Title,
      description: record.Description,
      target_amount: record.TargetAmount,
      deadline: record.Deadline,
      currency: record.Currency,
      category: record.Category,
      ...(user?.role === 'admin' && { status: record.Status }),
    });
    setIsModalVisible(true);
  };
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = { ...values, target_amount: Number(values.target_amount) };
      if (editingCampaign) {
        await axios.put(
          `api/campaigns/detail/${editingCampaign.ID}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Campaign updated successfully");
      } else {
        await axios.post(
          `api/campaigns`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        message.success("Campaign created successfully");
      }
      setIsModalVisible(false);
      fetchCampaigns(pagination.current, pagination.pageSize);
    } catch (error) {
      message.error("Error saving campaign");
    }
  };

  // table columns
  const columns = [
    { title: 'Title', dataIndex: 'Title', key: 'Title', sorter: true },
    { title: 'Description', dataIndex: 'Description', key: 'Description' },
    { title: 'Target Amount', dataIndex: 'TargetAmount', key: 'TargetAmount', sorter: true },
    { title: 'Current Amount', dataIndex: 'CurrentAmount', key: 'CurrentAmount', sorter: true },
    { title: 'Deadline', dataIndex: 'Deadline', key: 'Deadline' },
    { title: 'Status', dataIndex: 'Status', key: 'Status' },
  ];
  if (user && ['campaign_creator','admin'].includes(user.role)) {
    columns.push({
      title: 'Actions', key: 'actions', render: (_, record) => (
        <Button type="link" onClick={() => handleEditCampaign(record)}>Edit</Button>
      )
    });
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>My Campaigns</Title>

      {/* Filters UI */}
      <Space style={{ marginBottom: 16 }} wrap>
        <Input.Search
          placeholder="Search campaigns"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 200 }}
        />
        <Select
          placeholder="Filter by category"
          allowClear
          options={categoryOptions}
          style={{ width: 160 }}
          value={categoryFilter}
          onChange={setCategoryFilter}
        />
        <Select
          placeholder="Filter by status"
          allowClear
          options={[
            { label: 'Pending', value: 'pending' },
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
          ]}
          style={{ width: 160 }}
          value={statusFilter}
          onChange={setStatusFilter}
        />
      </Space>

      {loading ? (
        <Spin />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredData}
          pagination={{ ...pagination, total: filteredData.length }}
          onChange={handleTableChange}
          bordered
        />
      )}

      <Modal
        title={editingCampaign ? 'Edit Campaign' : 'Create Campaign'}
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        {/* Modal form same as before */}
        <Form form={form} layout="vertical">
          {/* ... form items ... */}
        </Form>
      </Modal>
    </div>
  );
};

export default Campaigns;
