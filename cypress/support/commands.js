Cypress.Commands.add('login', () => {
  cy.visit('/login');
  cy.get('#email').type('existing@example.com');
  cy.get('#password').type('Password123!');
  cy.get('form').submit();
});
