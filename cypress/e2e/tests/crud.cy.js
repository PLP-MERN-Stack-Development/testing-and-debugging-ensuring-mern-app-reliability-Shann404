import { ItemPage } from '../pages/itemPage';

const itemPage = new ItemPage();

describe('CRUD Operations', () => {
  const itemName = 'Test Item';
  const updatedName = 'Updated Item';

  beforeEach(() => {
    // Assume user is logged in
    cy.login(); // You can create a custom Cypress command for login
  });

  it('creates a new item', () => {
    itemPage.visit();
    itemPage.createItem(itemName, 'This is a test item');
    cy.contains(itemName);
  });

  it('edits an existing item', () => {
    itemPage.editItem(itemName, updatedName);
    cy.contains(updatedName);
  });

  it('deletes an item', () => {
    itemPage.deleteItem(updatedName);
    cy.contains(updatedName).should('not.exist');
  });
});
