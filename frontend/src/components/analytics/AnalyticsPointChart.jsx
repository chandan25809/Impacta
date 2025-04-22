// src/components/AnalyticsPointChart.jsx
import React from 'react';
import { Scatter } from '@ant-design/charts';

const AnalyticsPointChart = ({ revenueData, title }) => {
  const config = {
    data: revenueData,
    xField: 'category',  // x-axis will use the campaign category (categorical)
    yField: 'revenue',   // y-axis will display the daily revenue
    // Set a constant size for each point; you could also use a field for dynamic sizing.
    size: 5,
    shape: 'circle',
    pointStyle: {
      fill: '#1890ff',
      stroke: '#fff',
      lineWidth: 1,
    },
    xAxis: {
      type: 'cat',
      title: { text: 'Category' },
    },
    yAxis: {
      title: { text: 'Daily Revenue ($)' },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.category, value: datum.revenue };
      },
    },
    interactions: [{ type: 'element-active' }],
  };

  return (
    <div>
      {title && <h3 style={{ textAlign: 'center' }}>{title}</h3>}
      <Scatter {...config} />
    </div>
  );
};

export default AnalyticsPointChart;
