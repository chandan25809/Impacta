// src/pages/CreateCampaign.test.jsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CreateCampaign from './CreateCampaign';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { vi } from 'vitest';
import { message } from 'antd';

// Mock axios
vi.mock('axios');

// Helper: Create a dummy Cloudinary widget response
const dummyBannerUrl = 'https://example.com/banner.jpg';
const dummySupportingUrl = 'https://example.com/supporting.pdf';

// Before all tests, set up a mock for the Cloudinary widget
beforeAll(() => {
  window.cloudinary = {
    openUploadWidget: (config, callback) => {
      // Use the cloudinary config to determine which upload is happening
      // For simplicity, if the button text contains "Banner", return banner URL,
      // otherwise return supporting document URL.
      if (config.uploadPreset === 'impacta-banner') {
        callback(null, { event: 'success', info: { secure_url: dummyBannerUrl } });
      } else {
        callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
      }
    },
  };
});

// Optionally, you can override the functions in your component by spying on them,
// but here we simulate Cloudinary by using different presets.
// For this example, we assume that in your component you could configure the preset
// based on the upload type. If not, you can override openUploadWidget manually per test.

describe('CreateCampaign Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <CreateCampaign />
      </MemoryRouter>
    );
  };

  it('uploads banner image and displays the URL', async () => {
    renderComponent();
    // Override Cloudinary preset for banner upload
    window.cloudinary.openUploadWidget = (config, callback) => {
      callback(null, { event: 'success', info: { secure_url: dummyBannerUrl } });
    };

    const bannerButton = screen.getByText(/Click to Upload Banner/i);
    fireEvent.click(bannerButton);

    await waitFor(() => {
      // Expect the banner URL to be displayed in the component
      expect(screen.getByText(new RegExp(dummyBannerUrl, 'i'))).toBeInTheDocument();
    });
  });

  it('uploads supporting document and displays the URL', async () => {
    // Override Cloudinary preset for supporting document upload
    window.cloudinary.openUploadWidget = (config, callback) => {
      callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
    };

    renderComponent();
    const supportingButton = screen.getByText(/Click to Upload Supporting Docs/i);
    fireEvent.click(supportingButton);

    await waitFor(() => {
      expect(screen.getByText(new RegExp(dummySupportingUrl, 'i'))).toBeInTheDocument();
    });
  });


});
// src/pages/CreateCampaign.test.jsx

// // src/pages/CreateCampaign.test.jsx
// import '@testing-library/jest-dom';

// // Polyfill for NodeList.prototype.includes in jsdom
// if (typeof NodeList !== 'undefined' && !NodeList.prototype.includes) {
//   NodeList.prototype.includes = Array.prototype.includes;
// }

// import React from 'react';
// import { render, screen, waitFor, fireEvent } from '@testing-library/react';
// import CreateCampaign from './CreateCampaign';
// import { MemoryRouter } from 'react-router-dom';
// import axios from 'axios';
// import { vi } from 'vitest';
// import { message } from 'antd';

// // Mock axios
// vi.mock('axios');

// // Dummy URLs for testing
// const dummyBannerUrl = 'https://example.com/banner.jpg';
// const dummySupportingUrl = 'https://example.com/supporting.pdf';

// // Set up a global Cloudinary widget mock
// beforeAll(() => {
//   // Default Cloudinary widget mock. Individual tests may override this.
//   window.cloudinary = {
//     openUploadWidget: (config, callback) => {
//       // Use uploadPreset if needed; here we simply return the supporting URL by default.
//       if (config.uploadPreset === 'impacta-banner') {
//         callback(null, { event: 'success', info: { secure_url: dummyBannerUrl } });
//       } else {
//         callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
//       }
//     },
//   };
// });

// describe('CreateCampaign Component', () => {
//   beforeEach(() => {
//     vi.clearAllMocks();
//     localStorage.clear();
//   });

//   const renderComponent = () => {
//     return render(
//       <MemoryRouter>
//         <CreateCampaign />
//       </MemoryRouter>
//     );
//   };

//   it('renders all form fields', () => {
//     renderComponent();
//     expect(screen.getByPlaceholderText(/Enter campaign title/i)).toBeInTheDocument();
//     expect(screen.getByPlaceholderText(/Describe your campaign/i)).toBeInTheDocument();
//     expect(screen.getByPlaceholderText(/Enter goal amount/i)).toBeInTheDocument();
//     expect(screen.getByText(/Select a category/i)).toBeInTheDocument();
//     expect(screen.getByText(/Click to Upload Banner/i)).toBeInTheDocument();
//     expect(screen.getByText(/Click to Upload Supporting Docs/i)).toBeInTheDocument();
//     expect(screen.getByText(/Campaign Duration/i)).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /Create Campaign/i })).toBeInTheDocument();
//   });

//   it('uploads banner image and displays the URL', async () => {
//     renderComponent();
//     // Override Cloudinary preset for banner upload
//     window.cloudinary.openUploadWidget = (config, callback) => {
//       callback(null, { event: 'success', info: { secure_url: dummyBannerUrl } });
//     };

//     const bannerButton = screen.getByText(/Click to Upload Banner/i);
//     fireEvent.click(bannerButton);

//     // Use findByRole to wait for the banner link to appear
//     const bannerLink = await screen.findByRole('link', { name: dummyBannerUrl });
//     expect(bannerLink).toBeInTheDocument();
//     expect(bannerLink).toHaveAttribute('href', dummyBannerUrl);
//   });

//   it('uploads supporting document and displays the URL', async () => {
//     // Override Cloudinary preset for supporting document upload
//     window.cloudinary.openUploadWidget = (config, callback) => {
//       callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
//     };

//     renderComponent();
//     const supportingButton = screen.getByText(/Click to Upload Supporting Docs/i);
//     fireEvent.click(supportingButton);

//     const supportingLink = await screen.findByRole('link', { name: dummySupportingUrl });
//     expect(supportingLink).toBeInTheDocument();
//     expect(supportingLink).toHaveAttribute('href', dummySupportingUrl);
//   });

//   it('shows error if banner image is missing on submit', async () => {
//     // Spy on message.error to verify error message
//     const messageErrorSpy = vi.spyOn(message, 'error').mockImplementation(() => {});

//     // Override Cloudinary for supporting document upload only
//     window.cloudinary.openUploadWidget = (config, callback) => {
//       callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
//     };

//     renderComponent();
//     const supportingButton = screen.getByText(/Click to Upload Supporting Docs/i);
//     fireEvent.click(supportingButton);

//     // Wait for supporting document link to appear
//     await screen.findByRole('link', { name: dummySupportingUrl });

//     // Fill out other required fields
//     fireEvent.change(screen.getByPlaceholderText(/Enter campaign title/i), {
//       target: { value: 'Test Campaign' },
//     });
//     fireEvent.change(screen.getByPlaceholderText(/Describe your campaign/i), {
//       target: { value: 'This is a test campaign' },
//     });
//     fireEvent.change(screen.getByPlaceholderText(/Enter goal amount/i), {
//       target: { value: '1000' },
//     });
//     // Skipping category and duration for this error case

//     fireEvent.click(screen.getByRole('button', { name: /Create Campaign/i }));
//     await waitFor(() => {
//       expect(messageErrorSpy).toHaveBeenCalledWith("Please upload a banner image.");
//     });
//   });

//   it('submits the form successfully when all required fields are filled', async () => {
//     // Override Cloudinary for banner and supporting document uploads
//     window.cloudinary.openUploadWidget = (config, callback) => {
//       // For testing, regardless of the config, return the dummyBannerUrl for banner uploads and dummySupportingUrl for supporting docs.
//       if (config.uploadPreset === 'impacta') {
//         // Assume our component uses uploadPreset "impacta" for banner uploads
//         callback(null, { event: 'success', info: { secure_url: dummyBannerUrl } });
//       } else {
//         callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
//       }
//     };

//     // Mock API responses: first for campaign creation, then for media file uploads
//     axios.post.mockResolvedValueOnce({ status: 201, data: { campaign: { ID: '12345' } } });
//     axios.post.mockResolvedValueOnce({ status: 200 }); // for supporting document upload

//     // Set a dummy token in localStorage
//     localStorage.setItem("token", "dummy-token");

//     renderComponent();

//     // Simulate banner upload
//     const bannerButton = screen.getByText(/Click to Upload Banner/i);
//     fireEvent.click(bannerButton);
//     const bannerLink = await screen.findByRole('link', { name: dummyBannerUrl });
//     expect(bannerLink).toBeInTheDocument();

//     // Simulate supporting document upload
//     const supportingButton = screen.getByText(/Click to Upload Supporting Docs/i);
//     fireEvent.click(supportingButton);
//     const supportingLink = await screen.findByRole('link', { name: dummySupportingUrl });
//     expect(supportingLink).toBeInTheDocument();

//     // Fill in other fields
//     fireEvent.change(screen.getByPlaceholderText(/Enter campaign title/i), { target: { value: 'Test Campaign' } });
//     fireEvent.change(screen.getByPlaceholderText(/Describe your campaign/i), { target: { value: 'This is a test campaign' } });
//     fireEvent.change(screen.getByPlaceholderText(/Enter goal amount/i), { target: { value: '1000' } });
//     // For simplicity, assume category and duration are not required for this test.

//     // Click submit button
//     fireEvent.click(screen.getByRole('button', { name: /Create Campaign/i }));

//     // Verify axios.post is called for campaign creation with expected payload
//     await waitFor(() => {
//       expect(axios.post).toHaveBeenCalledWith(
//         '/api/campaigns',
//         expect.objectContaining({
//           title: 'Test Campaign',
//           description: 'This is a test campaign',
//           target_amount: 1000,
//           currency: 'USD',
//           image: dummyBannerUrl,
//         }),
//         expect.objectContaining({
//           headers: expect.objectContaining({
//             Authorization: `Bearer dummy-token`,
//             "Content-Type": "application/json",
//           }),
//         })
//       );
//     });

//     // Verify that the supporting document upload was triggered (axios.post called again)
//     await waitFor(() => {
//       expect(axios.post).toHaveBeenCalledTimes(2);
//     });
//   });
// });
