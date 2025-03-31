import React, { useEffect, useState } from "react";
import { Table, Typography, Spin } from "antd";

const { Title } = Typography;

const DashboardTable = () => {
  const [data, setData] = useState([]);        // Table data
  const [loading, setLoading] = useState(true); // Spinner
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });

  // Dummy data function (replace with API later)
  const fetchData = async (page = 1, pageSize = 5) => {
    setLoading(true);

    // Simulating an API call with dummy data
    setTimeout(() => {
      const dummyResponse = {
        total: 20,
        data: Array.from({ length: pageSize }, (_, index) => {
          const id = (page - 1) * pageSize + index + 1;
          return {
            key: id,
            name: `Campaign ${id}`,
            status: id % 2 === 0 ? "Active" : "Pending",
            creator: `User ${id}`,
            raised: `$${(Math.random() * 10000).toFixed(2)}`,
          };
        }),
      };

      setData(dummyResponse.data);
      setPagination((prev) => ({
        ...prev,
        current: page,
        pageSize,
        total: dummyResponse.total,
      }));
      setLoading(false);
    }, 800);
  };

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize);
  }, []);

  const handleTableChange = (pagination) => {
    fetchData(pagination.current, pagination.pageSize);
  };

  const columns = [
    {
      title: "Campaign Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
    },
    {
      title: "Creator",
      dataIndex: "creator",
      key: "creator",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Active", value: "Active" },
        { text: "Pending", value: "Pending" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Amount Raised",
      dataIndex: "raised",
      key: "raised",
      sorter: true,
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <Title level={3}>Campaign Dashboard</Title>

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
    </div>
  );
};

export default DashboardTable;