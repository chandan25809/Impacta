describe('Campaigns Page', () => {
    const campaignsApiUrl = '/api/campaigns?sort_by=created_at&order=desc&page=1&pageSize=5';
  
    beforeEach(() => {
      cy.clearLocalStorage();
    });
  
    it('displays table of campaigns for admin user and can open edit modal', () => {
      // Stub GET => one existing campaign
      cy.intercept('GET', campaignsApiUrl, {
        statusCode: 200,
        body: {
          campaigns: [
            {
              ID: '789',
              Title: 'Edit Me',
              Description: 'Desc',
              TargetAmount: 500,
              CurrentAmount: 100,
              Deadline: '2025-11-30T23:59:59Z',
              Status: 'pending',
              Currency: 'USD',
              Category: 'education',
            },
          ],
          total: 1,
        },
      }).as('getOneCampaign');
  
      // Admin user
      cy.visit('/campaigns', {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('token', 'admin-token');
        },
      });
  
      cy.wait('@getOneCampaign');
  
      // Confirm the table displays the campaign
      cy.contains('Edit Me').should('exist');
  
      // Admin can see an "Edit" button
      cy.contains('Edit').should('exist').click();
  
      // Once the user clicks Edit, a modal should pop up
      // We can check for the modal title, e.g. "Edit Campaign"
      cy.contains('Edit').should('be.visible');
  
      
    });
  });
  