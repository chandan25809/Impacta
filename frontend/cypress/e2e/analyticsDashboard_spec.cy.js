describe('Analytics Dashboard', () => {
    beforeEach(() => {
      // Visit the analytics dashboard page. Adjust the URL if necessary.
      cy.visit('/analytics');
    });
  
    it('renders the main dashboard title', () => {
      cy.contains('Admin Analytics Dashboard').should('be.visible');
    });
  
    it('displays all four chart titles', () => {
      cy.contains('Campaign Performance by Category').should('be.visible');
      cy.contains('Campaign Creation Trends').should('be.visible');
      cy.contains('Campaign Success Distribution').should('be.visible');
      cy.contains('Daily Revenue by Category').should('be.visible');
    });
  
    it('renders chart components within LongPressWrapper', () => {
      // Verify that there are exactly 4 instances of the LongPressWrapper (one for each chart)
      cy.get('[data-testid="long-press-wrapper"]').should('have.length', 4);
    });
  });
  