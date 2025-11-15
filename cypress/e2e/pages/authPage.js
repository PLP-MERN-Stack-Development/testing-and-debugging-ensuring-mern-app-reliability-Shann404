export class AuthPage {
  visitRegister() {
    cy.visit('/register');
  }

  visitLogin() {
    cy.visit('/login');
  }

  fillRegistrationForm(user) {
    cy.get('#username').type(user.username);
    cy.get('#email').type(user.email);
    cy.get('#password').type(user.password);
    cy.get('form').submit();
  }

  fillLoginForm(user) {
    cy.get('#email').type(user.email);
    cy.get('#password').type(user.password);
    cy.get('form').submit();
  }
}
