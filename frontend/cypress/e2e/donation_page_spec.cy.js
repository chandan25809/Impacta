// cypress/e2e/donation_page_spec.cy.js
describe('Donation Page', () => {
  // Use a test campaign ID matching your test fixtures or mocks
  const campaignId = 'efce051d-34c2-4c72-8e79-b9a4046f3ddf';

  // Define inline mocks (adjust these as needed)
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
      ID: "media-1",
      CampaignID: campaignId,
      FileType: "banner",
      URL: "https://example.com/banner.jpg",
    },
  ];

  const mockComments = {
    comments: [
      {
        ID: "comment-1",
        CampaignID: campaignId,
        User: { FullName: "John Doe" },
        Content: "This is a test comment.",
        CreatedAt: "2025-03-01T23:21:24.640817Z",
      },
    ],
  };

  const mockDonations = {
    donations: [
      {
        ID: "donation-1",
        CampaignID: campaignId,
        Donor: { FullName: "Jane Smith" },
        Amount: 50,
        CreatedAt: "2025-03-02T10:23:21.69703Z",
      },
    ],
  };

  beforeEach(() => {
    // Intercept API calls and return our mock data
    cy.intercept('GET', `/api/campaigns/detail/${campaignId}`, {
      statusCode: 200,
      body: mockCampaign,
    }).as('getCampaign');

    cy.intercept('GET', `/api/campaigns/${campaignId}/mediafiles`, {
      statusCode: 200,
      body: mockMediaFiles,
    }).as('getMediaFiles');

    cy.intercept('GET', `/api/campaigns/${campaignId}/comments`, {
      statusCode: 200,
      body: mockComments,
    }).as('getComments');

    cy.intercept('GET', `/api/campaigns/detail/${campaignId}/donations`, {
      statusCode: 200,
      body: mockDonations,
    }).as('getDonations');

    // Visit the donation page with the campaign ID in the URL
    cy.visit(`/donation/${campaignId}`);
    // Wait for all API calls to complete before running tests
    cy.wait(['@getCampaign', '@getMediaFiles', '@getComments', '@getDonations']);
  });

  it('displays campaign details', () => {
    // Verify campaign title and description are visible
    cy.contains('Test Campaign 2').should('be.visible');
    cy.contains('This is a test campaign').should('be.visible');
  });

  it('displays the banner image', () => {
    // Check the banner image has the correct src attribute
    cy.get('img[alt="Campaign Banner"]')
      .should('have.attr', 'src')
      .and('include', 'https://example.com/banner.jpg');
  });

  it('displays comments', () => {
    // Verify that a comment is rendered (adjust selector as needed)
    cy.contains('John Doe').should('be.visible');
    cy.contains('This is a test comment.').should('be.visible');
  });

  it('displays recent donations', () => {
    // Check that the donation summary is visible and includes a donation from Jane Smith
    cy.contains('Recent donations').should('be.visible');
    cy.contains('Jane Smith donated $50').should('be.visible');
  });

  it('opens donation modal when clicking Donate now', () => {
    // Click the first "Donate now" button (in the donation summary or donation form)
    cy.contains('Donate now').first().click();
    // Check that a modal is visible; adjust the selector if needed
    cy.get('.ant-modal').should('be.visible');
  });
});
