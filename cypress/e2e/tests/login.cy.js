import { AuthPage } from '../pages/authPage';
import users from '../fixtures/users.json';

const authPage = new AuthPage();

describe('User Login', () => {
  it('logs in successfully with valid credentials', () => {
    authPage.visitLogin();
    authPage.fillLoginForm(users.existingUser);
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome');
  });

  it('shows error for invalid credentials', () => {
    authPage.visitLogin();
    authPage.fillLoginForm({ email: 'wrong@example.com', password: 'wrong' });
    cy.contains('Invalid email or password');
  });
});
