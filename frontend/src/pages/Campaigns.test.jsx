/** @vitest-environment jsdom */
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import axios from 'axios';
import Campaigns from './Campaigns';

// Mock axios for API calls
vi.mock('axios');

// Mock AuthContext so that useAuth returns a user with role 'campaign_creator'
vi.mock('../AuthContext', () => ({
  useAuth: () => ({
    user: { role: 'campaign_creator' },
  }),
}));

describe('Campaigns Component', () => {
  // Dummy campaign data that our API would return
  const mockCampaignsData = {
    campaigns: [
      {
        ID: '1',
        Title: 'Campaign One',
        Description: 'First campaign description',
        TargetAmount: 5000,
        CurrentAmount: 1500,
        Deadline: '2025-12-31T23:59:59Z',
        Status: 'active',
        Currency: 'USD',
        Category: 'education',
      },
      {
        ID: '2',
        Title: 'Campaign Two',
        Description: 'Second campaign description',
        TargetAmount: 10000,
        CurrentAmount: 3000,
        Deadline: '2025-11-30T23:59:59Z',
        Status: 'pending',
        Currency: 'USD',
        Category: 'health',
      },
    ],
    total: 2,
  };

  beforeEach(() => {
    // Mock the API call that fetches campaigns.
    axios.get.mockResolvedValueOnce({ data: mockCampaignsData });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <Campaigns />
      </MemoryRouter>
    );
  };

  it('renders a spinner initially then displays campaign data in a table', async () => {
    renderComponent();
    // Check for the spinner via its CSS class
    expect(document.querySelector('.ant-spin-spinning')).toBeTruthy();

    // Wait for the campaign data to load and table rows to appear.
    await waitFor(() => {
      expect(screen.getByText('Campaign One')).toBeInTheDocument();
      expect(screen.getByText('Campaign Two')).toBeInTheDocument();
    });
  });

  it('renders the Create Campaign button when the user is a campaign creator', async () => {
    renderComponent();
    // Wait for the campaigns to load by checking for the heading.
    await waitFor(() => {
      // Use getByRole for heading with level 3 and a case-insensitive match for "My Campaigns"
      expect(screen.getByRole('heading', { level: 3, name: /my campaigns/i })).toBeInTheDocument();
    });
    // Then check that the Create Campaign button is rendered.
    const createButton = screen.getByRole('button', { name: /create campaign/i });
    expect(createButton).toBeInTheDocument();
  });

  it('opens the modal when the Create Campaign button is clicked', async () => {
    renderComponent();
    // Wait for the campaigns heading to confirm that the fetch has completed.
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: /my campaigns/i })).toBeInTheDocument();
    });
    // Click the Create Campaign button.
    fireEvent.click(screen.getByRole('button', { name: /create campaign/i }));
    // Wait for the modal to appear—Ant Design’s Modal renders with role "dialog"
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
