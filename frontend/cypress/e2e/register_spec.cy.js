// cypress/e2e/register_spec.cy.js
describe('Register Page', () => {
    beforeEach(() => {
      // Intercept the registration API call and return a 201 response
      cy.intercept('POST', '/api/register', {
        statusCode: 201,
        body: {},
      }).as('registerApi');
  
      // Visit the register page (baseUrl should be set in cypress.config.js)
      cy.visit('/register');
    });
  
    it('renders the register form', () => {
      cy.get('input[placeholder="Enter your full name"]').should('be.visible');
      cy.get('input[placeholder="Enter your email"]').should('be.visible');
      cy.get('input[placeholder="Enter a strong password"]').should('be.visible');
      cy.get('input[placeholder="Re-enter your password"]').should('be.visible');
      cy.get('button').contains('Register').should('be.visible');
    });
  
    it('shows validation errors when fields are empty', () => {
      cy.get('button').contains('Register').click();
      cy.contains('Please enter your full name').should('be.visible');
      cy.contains('Please enter your email').should('be.visible');
      cy.contains('Please enter your password').should('be.visible');
      cy.contains('Please re-enter your password').should('be.visible');
    });
  
    it('shows an error when passwords do not match', () => {
      cy.get('input[placeholder="Enter your full name"]').type('John Doe');
      cy.get('input[placeholder="Enter your email"]').type('john@example.com');
      cy.get('input[placeholder="Enter a strong password"]').type('Password1!');
      cy.get('input[placeholder="Re-enter your password"]').type('Password2!');
      cy.get('button').contains('Register').click();
      cy.contains('Passwords do not match!').should('be.visible');
    });
  
    it('submits the form successfully and redirects to login', () => {
      // Fill in the form with matching passwords
      cy.get('input[placeholder="Enter your full name"]').type('John Doe');
      cy.get('input[placeholder="Enter your email"]').type('john@example.com');
      cy.get('input[placeholder="Enter a strong password"]').type('Password1!');
      cy.get('input[placeholder="Re-enter your password"]').type('Password1!');
  
      cy.get('button').contains('Register').click();
  
      // Wait for the API call
      cy.wait('@registerApi');
  
      // Check for the success message
      cy.contains('Registration successful! Redirecting to login...').should('be.visible');
  
      // Wait for 2.1 seconds to allow redirection (setTimeout in component)
      cy.wait(2100);
  
      // Verify that the URL includes "/login"
      cy.url().should('include', '/login');
    });
  });
  