// src/components/AggregateLineChart.jsx
import React from 'react';
import { Line } from '@ant-design/charts';

const AggregateLineChart = ({ campaigns, title }) => {
  // Aggregate campaigns by creation date (YYYY-MM-DD) and count them.
  const aggregateCampaignsByDate = (campaigns) => {
    const result = {};
    campaigns.forEach(campaign => {
      // Extract the date portion from CreatedAt (e.g., "2025-03-03")
      const date = new Date(campaign.CreatedAt).toISOString().split('T')[0];
      result[date] = (result[date] || 0) + 1;
    });
    // Convert the aggregated object into an array of objects.
    return Object.entries(result).map(([date, count]) => ({ date, count }));
  };

  const aggregatedData = aggregateCampaignsByDate(campaigns);

  // Configuration for the line chart.
  const config = {
    data: aggregatedData,
    xField: 'date',         // x-axis shows the date.
    yField: 'count',        // y-axis shows the number of campaigns.
    label: {
      visible: true,
      position: 'top',
    },
    point: {
      size: 5,
      shape: 'diamond',
    },
    smooth: true,           // Smooth curves for the line chart.
    tooltip: {
      showMarkers: true,
    },
  };

  return (
    <div>
      {title && <h3>{title}</h3>}
      <Line {...config} />
    </div>
  );
};

export default AggregateLineChart;
