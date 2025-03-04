describe('Create Campaign Page', () => {
    const campaignData = {
      title: "Test Campaign",
      description: "This is a test campaign",
      goal: 1000,
      category: "education",
      // For simplicity, we're not interacting with the DatePicker in this test.
    };
  
    // Dummy URLs to simulate Cloudinary uploads
    const dummyBannerUrl = 'https://example.com/banner.jpg';
    const dummySupportingUrl = 'https://example.com/supporting.pdf';
  
    beforeEach(() => {
      // Intercept the campaign creation API call and media file uploads
      cy.intercept('POST', '/api/campaigns', {
        statusCode: 201,
        body: { campaign: { ID: '12345' } },
      }).as('createCampaign');
  
      cy.intercept('POST', '/api/mediafiles', {
        statusCode: 200,
        body: {},
      }).as('uploadMedia');
  
      // Visit the Create Campaign page.
      // Ensure your Cypress baseUrl (in cypress.config.js) is set to your running app’s URL
      cy.visit('/createcampaign');
    });
  
    it('renders the create campaign form', () => {
      // Verify input fields and buttons appear.
      cy.get('input[placeholder="Enter campaign title"]').should('be.visible');
      cy.get('textarea[placeholder="Describe your campaign..."]').should('be.visible');
      cy.get('input[placeholder="Enter goal amount"]').should('be.visible');
      cy.contains('Select a category').should('be.visible');
      cy.contains('Click to Upload').should('be.visible');
      cy.contains('Click to Upload Supporting Docs').should('be.visible');
      cy.contains('Campaign Duration').should('be.visible');
      cy.get('button').contains('Create Campaign').should('be.visible');
    });
  
    it('simulates banner upload and displays the uploaded URL as a link', () => {
      // Stub Cloudinary widget for banner upload.
      cy.window().then((win) => {
        win.cloudinary = {
          openUploadWidget: (config, callback) => {
            // For banner upload, simulate a response with dummyBannerUrl.
            if (config.uploadPreset === 'impacta') {
              callback(null, { event: 'success', info: { secure_url: dummyBannerUrl } });
            }
          },
        };
      });
  
      cy.contains('Click to Upload').click();
      // Expect that the component displays a link containing the dummy banner URL.
      cy.get('a').contains(dummyBannerUrl).should('have.attr', 'href', dummyBannerUrl);
    });
  
    it('simulates supporting document upload and displays the uploaded URL as a link', () => {
      // Stub Cloudinary widget for supporting document upload.
      cy.window().then((win) => {
        win.cloudinary = {
          openUploadWidget: (config, callback) => {
            // For supporting docs, assume any preset not equal to 'impacta' returns dummySupportingUrl.
            if (config.uploadPreset !== 'impacta') {
              callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
            }
          },
        };
      });
  
      cy.contains('Click to Upload Supporting Docs').click();
      // Expect that a list item contains a link with the dummy supporting URL.
      cy.get('ul')
        .find('a')
        .contains(dummySupportingUrl)
        .should('have.attr', 'href', dummySupportingUrl);
    });
  
    it('shows an error when banner image is missing on form submission', () => {
      // Stub Cloudinary for supporting docs upload only.
      cy.window().then((win) => {
        win.cloudinary = {
          openUploadWidget: (config, callback) => {
            // Always return dummy supporting URL (simulate no banner uploaded)
            callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
          },
        };
      });
  
      // Upload a supporting document.
      cy.contains('Click to Upload Supporting Docs').click();
      cy.get('ul')
        .find('a')
        .contains(dummySupportingUrl)
        .should('have.attr', 'href', dummySupportingUrl);
  
      // Fill out required text fields.
      cy.get('input[placeholder="Enter campaign title"]').type(campaignData.title);
      cy.get('textarea[placeholder="Describe your campaign..."]').type(campaignData.description);
      cy.get('input[placeholder="Enter goal amount"]').type(String(campaignData.goal));
      cy.get('select').select(campaignData.category);
      // For simplicity, we assume the DatePicker is either pre-filled or not required.
  
      // Submit the form.
      cy.contains('Create Campaign').click();
  
      // Assert that an error message is displayed.
      cy.contains('Please upload a banner image.').should('be.visible');
    });
  
    it('submits the form successfully when all required fields are filled', () => {
      // Stub Cloudinary widget for both banner and supporting document uploads.
      cy.window().then((win) => {
        win.cloudinary = {
          openUploadWidget: (config, callback) => {
            // For banner upload, we expect a preset (e.g. "impacta") to return dummyBannerUrl.
            if (config.uploadPreset === 'impacta') {
              callback(null, { event: 'success', info: { secure_url: dummyBannerUrl } });
            } else {
              callback(null, { event: 'success', info: { secure_url: dummySupportingUrl } });
            }
          },
        };
      });
  
      // Simulate banner upload.
      cy.contains('Click to Upload').click();
      cy.get('a').contains(dummyBannerUrl).should('have.attr', 'href', dummyBannerUrl);
  
      // Simulate supporting document upload.
      cy.contains('Click to Upload Supporting Docs').click();
      cy.get('ul')
        .find('a')
        .contains(dummySupportingUrl)
        .should('have.attr', 'href', dummySupportingUrl);
  
      // Fill in the remaining fields.
      cy.get('input[placeholder="Enter campaign title"]').type(campaignData.title);
      cy.get('textarea[placeholder="Describe your campaign..."]').type(campaignData.description);
      cy.get('input[placeholder="Enter goal amount"]').type(String(campaignData.goal));
      cy.get('select').select(campaignData.category);
      // For simplicity, assume the DatePicker is pre-filled or not required.
  
      // Submit the form.
      cy.contains('Create Campaign').click();
  
      // Wait for API calls.
      cy.wait('@createCampaign');
      cy.wait('@uploadMedia');
  
      // Verify that a success message is displayed.
      cy.contains('Campaign created successfully!').should('be.visible');
    });
  });
  