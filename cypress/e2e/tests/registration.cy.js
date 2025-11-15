import { AuthPage } from '../pages/authPage';
import users from '../fixtures/users.json';

const authPage = new AuthPage();

describe('User Registration', () => {
  it('registers a new user successfully', () => {
    authPage.visitRegister();
    authPage.fillRegistrationForm(users.newUser);
    cy.url().should('include', '/dashboard');
    cy.contains(`Welcome, ${users.newUser.username}`);
  });

  it('shows error for existing user', () => {
    authPage.visitRegister();
    authPage.fillRegistrationForm(users.existingUser);
    cy.contains('User already exists');
  });
});
