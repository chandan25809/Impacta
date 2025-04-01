describe('Donation Dashboard Tests', () => {
    // Define mock data for tests
    const mockDonations = {
      donations: [
        {
          ID: '1',
          Donor: { FullName: 'Jane Doe', Email: 'jane@example.com' },
          Amount: 50,
          Currency: 'USD',
          Message: 'Great cause!',
          IsAnonymous: false,
          CreatedAt: '2025-03-02T10:23:21.69703Z',
          Status: 'completed'
        }
      ]
    };
  
    // IMPORTANT: Mock any redirects and authentication
    beforeEach(() => {
      // Prevent redirect to dashboard
      cy.intercept('GET', '/dashboard', (req) => {
        req.reply(404); // Prevent redirect by returning 404
      }).as('preventDashboardRedirect');
  
      // Mock user API (returning 500 in your logs)
      cy.intercept('GET', '/api/user*', {
        statusCode: 200,
        body: { id: 'test-user-id', name: 'Test User' }
      }).as('getUser');
  
      // Mock donations API
      cy.intercept('GET', '/api/user/donations', {
        statusCode: 200,
        body: mockDonations
      }).as('getDonations');
  
      // Mock POST for donation submission
      cy.intercept('POST', '/api/donations', {
        statusCode: 200,
        body: { success: true }
      }).as('submitDonation');
    });
  
    context('Non-Admin User Tests', () => {
      beforeEach(() => {
        // Start by disabling page navigation - important for SPAs that might redirect
        cy.window().then((win) => {
          cy.stub(win, 'open').as('windowOpen');
        });
        
        // Set up non-admin user
        window.localStorage.setItem('token', 'user-token');
        
        // Visit page and set user context
        cy.visit('/donation/some-campaign', {
          onBeforeLoad: (win) => {
            // Mock localStorage
            win.localStorage.setItem('token', 'user-token');
            
            // Mock navigation to prevent redirects
            const originalPushState = win.history.pushState;
            win.history.pushState = function() {
              // Log navigation attempts
              console.log('Navigation attempted:', arguments);
              return originalPushState.apply(this, arguments);
            };
            
            // Explicitly mock auth context
            win.mockUserRole = 'user';
          }
        });
      });
  
      it('renders the donation form', () => {
        // Check for donation form existence using data-testid attributes
        // based on the vitest tests
        cy.get('[data-testid="amount-input"]', { timeout: 10000 }).should('exist');
        cy.get('[data-testid="email-input"]').should('exist');
        cy.get('[data-testid="message-input"]').should('exist');
        cy.get('[data-testid="donate-button"]').should('exist');
      });
      
      it('shows donation data in the table', () => {
        // Check for Jane Doe - using the same data as in the vitest tests
        cy.contains('Jane Doe', { timeout: 10000 }).should('be.visible');
        cy.contains('50').should('be.visible');
        cy.contains('USD').should('be.visible');
      });
  
      it('submits a donation successfully', () => {
        // Fill out the form using data-testid attributes
        cy.get('[data-testid="amount-input"]').type('100');
        cy.get('[data-testid="email-input"]').type('test@example.com');
        cy.get('[data-testid="message-input"]').type('Test donation message');
        
        // Additional fields if needed based on your component
        cy.get('[data-testid="name-input"]').type('Test User');
        
        // Submit the form
        cy.get('[data-testid="donate-button"]').click();
        
        // Wait for success message (adjust selector based on your UI)
        cy.contains('success', { timeout: 10000 }).should('be.visible');
      });
    });
  
    context('Admin User Tests', () => {
      beforeEach(() => {
        // Set up admin user
        cy.visit('/donation/some-campaign', {
          onBeforeLoad: (win) => {
            win.localStorage.setItem('token', 'admin-token');
            win.mockUserRole = 'admin';
            
            // Create a mock object to inject into your AuthContext
            win.mockAuthObject = {
              user: { role: 'admin', id: 'admin-id' }
            };
            
            // Replace any redirects
            const originalReplace = win.location.replace;
            win.location.replace = function(url) {
              console.log('Redirect attempted to:', url);
              return false;
            };
          }
        });
      });
  
      it('shows admin view with table and edit button', () => {
        // Check for admin-specific content
        cy.contains('Jane Doe', { timeout: 10000 }).should('be.visible');
        
        // Should have Edit button
        cy.contains('button', 'Edit', { timeout: 10000 }).should('be.visible');
        
        // Should NOT have donation form
        cy.get('[data-testid="donate-button"]').should('not.exist');
      });
      
      it('can open edit modal', () => {
        // Click Edit button
        cy.contains('button', 'Edit', { timeout: 10000 }).click();
        
        // Check for modal or dialog
        cy.get('[role="dialog"]', { timeout: 10000 }).should('be.visible');
        cy.contains('Edit Donation').should('be.visible');
      });
    });
  
    // Test to debug any network or redirection issues
    it('DEBUG: logs navigation issues', () => {
      cy.visit('/donation/some-campaign', {
        onBeforeLoad: (win) => {
          // Set token
          win.localStorage.setItem('token', 'debug-token');
          
          // Log all navigation
          const originalPushState = win.history.pushState;
          win.history.pushState = function() {
            console.log('Navigation via pushState:', arguments);
            return originalPushState.apply(this, arguments);
          };
          
          // Log all redirects
          const originalReplace = win.location.replace;
          win.location.replace = function(url) {
            console.log('Redirect via replace:', url);
            // Don't actually redirect
            return false;
          };
          
          // Log all form submissions
          win.HTMLFormElement.prototype.originalSubmit = win.HTMLFormElement.prototype.submit;
          win.HTMLFormElement.prototype.submit = function() {
            console.log('Form submitted:', this.action || 'no action');
            return this.originalSubmit();
          };
        }
      });
      
      // Wait to capture logs
      cy.wait(5000);
    });
  });