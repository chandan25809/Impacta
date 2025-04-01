// src/pages/AnalyticsDashboard.jsx
import React, { useEffect, useState } from 'react';
import { Row, Col, Typography } from 'antd';
import AnalyticsBarChart from '../components/analytics/AnalyticsBarChart';
import AggregateLineChart from '../components/analytics/AnalyticsLineChart';
import AnalyticsDonutChart from '../components/analytics/AnalyticsDonutChart';
import AnalyticsPointChart from '../components/analytics/AnalyticsPointChart';
import LongPressWrapper from '../components/analytics/LongPressWrapper';

const { Title } = Typography;

const AnalyticsDashboard = () => {
  const [campaignsData, setCampaignsData] = useState([]);
  const [revenueData, setRevenueData] = useState([]);

  useEffect(() => {
    // Dummy campaign data (replace with API call later)
    const dummyCampaigns = [
      {
        ID: "1",
        CreatorID: "123",
        Title: "Campaign A",
        Description: "Description A",
        TargetAmount: 10000,
        CurrentAmount: 8000,
        Deadline: "2025-04-03T04:00:00Z",
        Status: "approved",
        Currency: "USD",
        Category: "education",
        CreatedAt: "2025-03-03T12:18:49.695006Z",
        UpdatedAt: "2025-03-03T12:18:49.695006Z"
      },
      {
        ID: "2",
        CreatorID: "124",
        Title: "Campaign B",
        Description: "Description B",
        TargetAmount: 20000,
        CurrentAmount: 15000,
        Deadline: "2025-04-10T04:00:00Z",
        Status: "pending",
        Currency: "USD",
        Category: "health",
        CreatedAt: "2025-03-04T12:18:49.695006Z",
        UpdatedAt: "2025-03-04T12:18:49.695006Z"
      },
      {
        ID: "3",
        CreatorID: "125",
        Title: "Campaign C",
        Description: "Description C",
        TargetAmount: 15000,
        CurrentAmount: 5000,
        Deadline: "2025-04-15T04:00:00Z",
        Status: "approved",
        Currency: "USD",
        Category: "education",
        CreatedAt: "2025-03-05T12:18:49.695006Z",
        UpdatedAt: "2025-03-05T12:18:49.695006Z"
      },
      {
        ID: "4",
        CreatorID: "126",
        Title: "Campaign D",
        Description: "Description D",
        TargetAmount: 5000,
        CurrentAmount: 3000,
        Deadline: "2025-04-20T04:00:00Z",
        Status: "pending",
        Currency: "USD",
        Category: "environment",
        CreatedAt: "2025-03-06T12:18:49.695006Z",
        UpdatedAt: "2025-03-06T12:18:49.695006Z"
      },
    ];
    setCampaignsData(dummyCampaigns);

    // Dummy revenue data for AnalyticsPointChart
    const dummyRevenue = [
      { category: 'education', revenue: 5000 },
      { category: 'health', revenue: 3000 },
      { category: 'environment', revenue: 2000 },
    ];
    setRevenueData(dummyRevenue);
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Admin Analytics Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Title level={4}>Campaign Performance by Category</Title>
          </div>
          <LongPressWrapper>
            <AnalyticsBarChart campaigns={campaignsData} />
          </LongPressWrapper>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Title level={4}>Campaign Creation Trends</Title>
          </div>
          <LongPressWrapper>
            <AggregateLineChart campaigns={campaignsData} />
          </LongPressWrapper>
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
        <Col xs={24} md={12}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Title level={4}>Campaign Success Distribution</Title>
          </div>
          <LongPressWrapper>
            <AnalyticsDonutChart campaigns={campaignsData} />
          </LongPressWrapper>
        </Col>
        <Col xs={24} md={12}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <Title level={4}>Daily Revenue by Category</Title>
          </div>
          <LongPressWrapper>
            <AnalyticsPointChart revenueData={revenueData} />
          </LongPressWrapper>
        </Col>
      </Row>
    </div>
  );
};

export default AnalyticsDashboard;