// src/components/AnalyticsDonutChart.jsx
import React from 'react';
import { Pie } from '@ant-design/charts';

const AnalyticsDonutChart = ({ campaigns, title }) => {
  // Aggregate campaign data:
  // For this example, we'll consider campaigns with status "approved" as success,
  // and all others as failure.
  const aggregated = campaigns.reduce((acc, campaign) => {
    const status = campaign.Status.toLowerCase();
    if (status === 'approved') {
      acc.success = (acc.success || 0) + 1;
    } else {
      acc.failure = (acc.failure || 0) + 1;
    }
    return acc;
  }, {});

  // Create data in the format expected by the Pie (donut) chart.
  const data = [
    { category: 'Success', value: aggregated.success || 0 },
    { category: 'Failure', value: aggregated.failure || 0 },
  ];

  const config = {
    data,
    angleField: 'value',      // Determines the angle of each slice
    colorField: 'category',   // Determines the color by category
    radius: 1,                // Full radius for the chart
    innerRadius: 0.6,         // Creates the donut effect
    label: {
      type: 'inner',
      offset: '-50%',
      content: '{percentage}',
      style: {
        textAlign: 'center',
        fontSize: 14,
      },
    },
    tooltip: {
      shared: true,
      showMarkers: true,
      formatter: (datum) => ({
        name: datum.category,
        value: datum.value,
      }),
    },
    interactions: [{ type: 'element-active' }], // Highlight slice on hover
    statistic: {
      title: false,
      content: {
        style: {
          whiteSpace: 'pre-wrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        },
        content: title || '',
      },
    },
  };

  return <Pie {...config} />;
};

export default AnalyticsDonutChart;
