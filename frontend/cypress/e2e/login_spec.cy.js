// cypress/e2e/login_spec.cy.js
describe('Login Page', () => {
    beforeEach(() => {
      // Intercept the login API call and return a fake token
      cy.intercept('POST', '/api/login', {
        statusCode: 200,
        body: { token: 'fake-jwt-token' },
      }).as('loginApi');
  
      // Visit the login page (baseUrl must be configured in cypress.config.js)
      cy.visit('/login');
    });
  
    it('displays the login form', () => {
      cy.get('input[placeholder="Enter email"]').should('be.visible');
      cy.get('input[placeholder="Enter password"]').should('be.visible');
      cy.get('button').contains('Login').should('be.visible');
    });
  
    it('shows validation errors when submitting an empty form', () => {
      cy.get('button').contains('Login').click();
      cy.contains('Please enter your email').should('be.visible');
      cy.contains('Please enter your password').should('be.visible');
    });
  
    it('logs in successfully and redirects to dashboard', () => {
      // Fill in the form fields
      cy.get('input[placeholder="Enter email"]').type('test@example.com');
      cy.get('input[placeholder="Enter password"]').type('password123');
      cy.get('button').contains('Login').click();
  
      // Wait for the API call to complete
      cy.wait('@loginApi');
  
      // Verify the token is stored in localStorage
      cy.window().then((win) => {
        expect(win.localStorage.getItem('token')).to.equal('fake-jwt-token');
      });
  
      // Wait a bit for the setTimeout in the component (1s delay)
      cy.wait(1200);
  
      // Check that the URL includes /dashboard (indicating a redirect)
      cy.url().should('include', '/dashboard');
    });
  });
  