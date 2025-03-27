// src/pages/DonationPage.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import DonationPage from './donation';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { vi } from 'vitest';

// Mock axios with Vitest
vi.mock('axios');

describe('DonationPage', () => {
  const campaignId = 'efce051d-34c2-4c72-8e79-b9a4046f3ddf';

  // Sample fixture data matching your API responses
  const mockCampaign = {
    campaign: {
      ID: campaignId,
      Title: "Test Campaign 2",
      Description: "This is a test campaign",
      TargetAmount: 5000,
      CurrentAmount: 1000,
      Currency: "USD",
    },
  };

  const mockMediaFiles = [
    {
      ID: '4bd69551-0078-4e17-acee-cab1ebb3fad7',
      FileType: "banner",
      URL: "https://example.com/banner.jpg",
    },
  ];

  const mockComments = {
    comments: [
      {
        ID: 'f392d9cd-93eb-4b0a-8ee6-60dd3af9e26a',
        User: { FullName: "John Doe" },
        Content: "This is a test comment.",
        CreatedAt: "2025-03-01T23:21:24.640817Z",
      },
    ],
  };

  const mockDonations = {
    donations: [
      {
        ID: '30099b19-2898-46fe-9117-e6ca5a2864c4',
        Donor: { FullName: "Jane Smith" },
        Amount: 50,
        CreatedAt: "2025-03-02T10:23:21.69703Z",
      },
    ],
  };

  beforeEach(() => {
    axios.get.mockImplementation((url) => {
      if (url === `/api/campaigns/detail/${campaignId}`) {
        return Promise.resolve({ data: mockCampaign });
      }
      if (url === `/api/campaigns/${campaignId}/mediafiles`) {
        return Promise.resolve({ data: mockMediaFiles });
      }
      if (url === `/api/campaigns/${campaignId}/comments`) {
        return Promise.resolve({ data: mockComments });
      }
      if (url === `/api/campaigns/detail/${campaignId}/donations`) {
        return Promise.resolve({ data: mockDonations });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={[`/donation/${campaignId}`]}>
        <Routes>
          <Route path="/donation/:campaignId" element={<DonationPage />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders loading state and then displays campaign details', async () => {
    renderComponent();
    // Assuming your component shows a "Loading campaign..." placeholder initially
    expect(screen.getByText(/Loading campaign/i)).toBeInTheDocument();

    // After data loads, check for campaign details
    await waitFor(() =>
      expect(screen.getByText("Test Campaign 2")).toBeInTheDocument()
    );
    expect(screen.getByText("This is a test campaign")).toBeInTheDocument();
  });

  it('renders banner image from media files', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByAltText("Campaign Banner")).toBeInTheDocument()
    );
    expect(screen.getByAltText("Campaign Banner")).toHaveAttribute(
      "src",
      "https://example.com/banner.jpg"
    );
  });

  it('renders comments', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText("John Doe")).toBeInTheDocument()
    );
    expect(screen.getByText("This is a test comment.")).toBeInTheDocument();
  });

  it('renders recent donations', async () => {
    renderComponent();
    await waitFor(() =>
      expect(screen.getByText(/Jane Smith donated \$50/i)).toBeInTheDocument()
    );
  });

//   it('opens donation modal when clicking Donate now button', async () => {
//     renderComponent();
//     await waitFor(() =>
//       expect(screen.getByText("Test Campaign 2")).toBeInTheDocument()
//     );
//     // Assuming the first "Donate now" button opens the donation modal
//     const donateButton = screen.getAllByText("Donate now")[0];
//     fireEvent.click(donateButton);
//     // Check that an element inside the modal is visible (adjust based on your modal content)
//     await waitFor(() =>
//       expect(screen.getByText(/Donate now/i)).toBeInTheDocument()
//     );
//   });
});
