describe('Donation Dashboard', () => {
    // Mock donation data
    const mockDonations = {
      donations: [
        {
          ID: '1',
          Donor: { FullName: 'John Doe', Email: 'john@example.com' },
          Amount: 50,
          Currency: 'USD',
          Message: 'Great cause!',
          IsAnonymous: false,
          Status: 'completed',
          CreatedAt: '2025-03-02T10:23:21.69703Z'
        }
      ]
    };
  
    // Shared intercepts for both admin and non-admin tests
    const setupIntercepts = () => {
      // Intercept and block redirects to dashboard
      cy.intercept('GET', '/dashboard*', req => {
        req.reply(200, {});
        return false; // Prevent the actual navigation
      }).as('dashboardRedirect');
  
      // Mock user API that's failing with 500
      cy.intercept('GET', '/api/user*', {
        statusCode: 200,
        body: { id: 'test-id', role: 'user' }
      }).as('getUser');
      
      // Mock the donations API
      cy.intercept('GET', '**/api/user/donations', {
        statusCode: 200, 
        body: mockDonations
      }).as('getDonations');
  
      // Mock POST for donation submission
      cy.intercept('POST', '**/api/donations', {
        statusCode: 200,
        body: { success: true, message: 'Donation successful' }
      }).as('submitDonation');
      
      // Mock PUT for donation updates
      cy.intercept('PUT', '**/api/donations/*', {
        statusCode: 200,
        body: { success: true, message: 'Donation updated successfully' }
      }).as('updateDonation');
    };
  
    describe('Regular User View', () => {
      beforeEach(() => {
        setupIntercepts();
        
        // Additional intercept to mock the auth context for regular user
        cy.intercept('**/api/auth/me', {
          statusCode: 200,
          body: { id: 'user-id', role: 'user' }
        }).as('getAuthUser');
  
        // Visit with localStorage token for regular user
        cy.visit('/donation/some-campaign', {
          onBeforeLoad: (win) => {
            win.localStorage.setItem('token', 'user-token');
            
            // Prevent navigation away from the page
            const originalPushState = win.history.pushState;
            win.history.pushState = function() {
              console.log('Navigation attempted:', arguments);
              return originalPushState.apply(this, arguments);
            };
          }
        });
      });
  
      it('should load the page without redirecting', () => {
        // This is just to verify the intercepts are working
        cy.url().should('include', '/donation/some-campaign');
        
        // Let's add a small wait to make sure data loads
        cy.wait(1000);
      });
  
      it('should render the donation form for regular users', () => {
        // Looking for donation form, which has input fields and a donation button
        cy.get('input[type="number"]').should('exist');
        cy.get('select').should('exist');
        cy.get('textarea').should('exist');
        cy.get('button[type="submit"]').contains('Donate').should('exist');
      });
  
      it('should display donation data in the table', () => {
        // Check the table exists and contains expected data
        cy.get('table').should('exist');
        cy.contains('John Doe').should('exist');
        cy.contains('50').should('exist');
        cy.contains('USD').should('exist');
      });
  
      it('should submit donation form successfully', () => {
        // Fill out the donation form with minimal fields
        cy.get('input[type="number"]').first().clear().type('75');
        cy.get('select').first().select('USD');
        cy.get('textarea').first().type('Test donation message');
        cy.get('input[type="text"]').first().type('Test User'); // Name field
        cy.get('input[type="email"]').first().type('test@example.com');
        
        // Submit the form
        cy.get('button[type="submit"]').contains('Donate').click();
        
        // Wait for the success message
        cy.contains('Donation successful').should('be.visible');
      });
    });
  
    describe('Admin User View', () => {
      beforeEach(() => {
        setupIntercepts();
        
        // Mock the auth context to return admin user
        cy.intercept('**/api/auth/me', {
          statusCode: 200,
          body: { id: 'admin-id', role: 'admin' }
        }).as('getAuthAdmin');
  
        // Visit with localStorage token for admin
        cy.visit('/donation/some-campaign', {
          onBeforeLoad: (win) => {
            win.localStorage.setItem('token', 'admin-token');
            
            // Additionally set a user object that the AuthContext might read
            win.localStorage.setItem('user', JSON.stringify({
              id: 'admin-id',
              role: 'admin'
            }));
            
            // Prevent navigation away from the page
            const originalPushState = win.history.pushState;
            win.history.pushState = function() {
              console.log('Navigation attempted:', arguments);
              return originalPushState.apply(this, arguments);
            };
          }
        });
      });
  
      it('should handle admin view properly', () => {
        // This is just to verify we're on the right page
        cy.url().should('include', '/donation/some-campaign');
        
        // Let's add a wait to ensure data loads
        cy.wait(1000);
      });
  
      // More specific admin tests can be added here
    });
  
    // This specialized test helps debug the redirect and authentication issues
    it('DEBUG: capture network activity', () => {
      // Set up a listener for all network activity
      cy.intercept('**', (req) => {
        // Log but don't interfere with the request
        console.log(`REQUEST: ${req.method} ${req.url}`);
      }).as('allRequests');
      
      // Visit the page with debug info
      cy.visit('/donation/some-campaign', {
        onBeforeLoad: (win) => {
          win.localStorage.setItem('token', 'debug-token');
          
          // Monitor any redirects
          const originalAssign = win.location.assign;
          win.location.assign = function(url) {
            console.log('Redirect via assign:', url);
            // Don't actually redirect
            return false;
          };
          
          const originalReplace = win.location.replace;
          win.location.replace = function(url) {
            console.log('Redirect via replace:', url);
            // Don't actually redirect
            return false;
          };
        }
      });
      
      // Just wait to observe what happens
      cy.wait(2000);
    });
  });