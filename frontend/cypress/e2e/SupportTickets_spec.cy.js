// cypress/e2e/support_tickets_spec.cy.js
/// <reference types="cypress" />

context('SupportTickets Page', () => {
    const initialTickets = [
      { ID: '1', Query: 'First question?', Answer: 'Yes, you can.' },
      { ID: '2', Query: 'Second question?', Answer: null },
    ];
  
    // Same two tickets but with the second now answered
    const updatedTickets = [
      { ID: '1', Query: 'First question?', Answer: 'Yes, you can.' },
      { ID: '2', Query: 'Second question?', Answer: 'Here is my admin answer' },
    ];
  
    beforeEach(() => {
      // Keep track of GET calls
      let getCount = 0;
  
      // Stub GET /api/support-tickets to return initialTickets first, then updatedTickets
      cy.intercept('GET', '/api/support-tickets', (req) => {
        getCount++;
        if (getCount === 1) {
          req.reply({ statusCode: 200, body: { tickets: initialTickets } });
        } else {
          req.reply({ statusCode: 200, body: { tickets: updatedTickets } });
        }
      }).as('getTickets');
  
      // Stub PUT /api/support-tickets/:id
      cy.intercept('PUT', '/api/support-tickets/*', {
        statusCode: 200,
        body: {},
      }).as('putAnswer');
    });
  
    describe('Guest', () => {
      beforeEach(() => {
        // Must set a token so fetchTickets() runs
        cy.window().then((win) => {
          win.localStorage.setItem('token', 'xxx.yyy.zzz');
        });
        cy.visit('/support');
        cy.wait('@getTickets');
      });
  
      it('renders the FAQ panels and shows my questions with Pending/Answered', () => {
        cy.contains('Frequently Asked Questions').should('be.visible');
        cy.contains('My Questions').should('be.visible');
  
        // First (answered)
        cy.contains('First question?').click();
        cy.contains('Answer: Yes, you can.').should('be.visible');
  
        // Second (pending)
        cy.contains('Second question?').click();
        cy.contains('Pending').should('be.visible');
  
        cy.contains('Ask Now').should('be.visible');
      });
    });
  
  //   describe('Admin', () => {
  //     beforeEach(() => {
  //       // Inject an admin JWT so role === "admin"
  //       const payload = btoa(JSON.stringify({ role: 'admin' }));
  //       cy.window().then((win) => {
  //         win.localStorage.setItem('token', `xxx.${payload}.zzz`);
  //       });
  //       cy.visit('/support');
  //       cy.wait('@getTickets'); // first fetch
  //     });
  
  //     it('lets admin submit an answer and then shows it', () => {
  //       cy.contains('User Questions').should('be.visible');
  
  //       // Expand the second ticket
  //       cy.contains('Second question?').click();
  
  //       // Type in the answer
  //       cy.get('textarea[placeholder="Enter your answer here..."]')
  //         .should('be.visible')
  //         .type('Here is my admin answer');
  
  //       // Submit and wait
  //       cy.contains('Submit Answer').click();
  //       cy.wait('@putAnswer');
  
  //       // After PUT, component re-fetches
  //       cy.wait('@getTickets'); // second fetch
  
  //       // Success toast
  //       cy.contains('Answer updated successfully!').should('be.visible');
  
  //       // Now the updated answer must appear
  //       cy.contains('Second question?').click(); // ensure panel is open
  //       cy.contains('Answer: Here is my admin answer').should('be.visible');
  //     });
  //   });
  });
  