// src/components/analytics/AnalyticsBarChart.jsx
import React from 'react';
import { Column } from '@ant-design/charts';

const AnalyticsBarChart = ({ campaigns, title }) => {
  const aggregateCampaigns = (campaigns) => {
    const aggregated = {};
    campaigns.forEach(campaign => {
      const cat = campaign.Category;
      const status = campaign.Status.toLowerCase();
      if (!aggregated[cat]) {
        aggregated[cat] = { approved: 0, pending: 0, completed: 0 };
      }
      if (status === 'approved' || status === 'active') {
        aggregated[cat].approved++;
      } else if (status === 'pending') {
        aggregated[cat].pending++;
      } else if (status === 'completed' || status === 'complete') {
        aggregated[cat].completed++;
      }
    });
    const result = [];
    for (const cat in aggregated) {
      result.push({ category: cat, status: 'Approved', count: aggregated[cat].approved });
      result.push({ category: cat, status: 'Pending', count: aggregated[cat].pending });
      result.push({ category: cat, status: 'Completed', count: aggregated[cat].completed });
    }
    console.log('Aggregated Data:', result);
    return result;
  };

  const data = aggregateCampaigns(campaigns);

  const config = {
    title: {
      visible: !!title,
      text: title || '',
    },
    data,
    isGroup: true,
    xField: 'category',
    yField: 'count',
    seriesField: 'status',
    label: {
      position: 'middle',
      style: { fill: '#FFFFFF', opacity: 0.8 },
    },
    tooltip: {
      shared: false,
      showMarkers: true,
      formatter: (datum) => `${datum.status}: ${datum.count}`,
    },
    // Updated color function with debug logging
    color: ({ status }) => {
      const normalizedStatus = status.trim();
      console.log("Color function status:", normalizedStatus);
      if (normalizedStatus === 'Approved') return "#4caf50";
      if (normalizedStatus === 'Pending') return "#ff9800";
      if (normalizedStatus === 'Completed') return "#007bff";
      return "#ccc";
    },
    interactions: [{ type: 'active-region' }],
  };

  return <Column {...config} />;
};

export default AnalyticsBarChart;
