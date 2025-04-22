// src/pages/AnalyticsDashboard.test.jsx
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AnalyticsDashboard from './AnalyticsDashboard';

// Mock the chart components so they render simple placeholders
vi.mock('../components/analytics/AnalyticsBarChart', () => ({
  default: () => <div data-testid="mock-analytics-bar-chart">Mock AnalyticsBarChart</div>,
}));

vi.mock('../components/analytics/AnalyticsLineChart', () => ({
  default: () => <div data-testid="mock-aggregate-line-chart">Mock AggregateLineChart</div>,
}));

vi.mock('../components/analytics/AnalyticsDonutChart', () => ({
  default: () => <div data-testid="mock-analytics-donut-chart">Mock AnalyticsDonutChart</div>,
}));

vi.mock('../components/analytics/AnalyticsPointChart', () => ({
  default: () => <div data-testid="mock-analytics-point-chart">Mock AnalyticsPointChart</div>,
}));

// Mock the LongPressWrapper to simply render its children
vi.mock('../components/analytics/LongPressWrapper', () => ({
  default: ({ children }) => <div data-testid="mock-long-press-wrapper">{children}</div>,
}));

describe('AnalyticsDashboard', () => {
  test('renders the main dashboard title', async () => {
    render(<AnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Admin Analytics Dashboard/i)).toBeInTheDocument();
    });
  });

  test('renders all four chart titles', async () => {
    render(<AnalyticsDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Campaign Performance by Category/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Creation Trends/i)).toBeInTheDocument();
      expect(screen.getByText(/Campaign Success Distribution/i)).toBeInTheDocument();
      expect(screen.getByText(/Daily Revenue by Category/i)).toBeInTheDocument();
    });
  });

  test('renders chart components wrapped in LongPressWrapper', async () => {
    render(<AnalyticsDashboard />);
    // Since multiple LongPressWrapper instances are rendered, use getAllByTestId
    const wrappers = await screen.findAllByTestId('mock-long-press-wrapper');
    expect(wrappers.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByTestId('mock-analytics-bar-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-aggregate-line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-analytics-donut-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-analytics-point-chart')).toBeInTheDocument();
  });
});
