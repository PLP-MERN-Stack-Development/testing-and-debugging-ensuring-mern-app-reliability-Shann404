export class ItemPage {
  visit() {
    cy.visit('/items');
  }

  createItem(name, description) {
    cy.get('#new-item-name').type(name);
    cy.get('#new-item-description').type(description);
    cy.get('#create-item-btn').click();
  }

  editItem(oldName, newName) {
    cy.contains(oldName)
      .parent()
      .find('.edit-btn')
      .click();
    cy.get('#item-name').clear().type(newName);
    cy.get('#save-btn').click();
  }

  deleteItem(name) {
    cy.contains(name).parent().find('.delete-btn').click();
  }
}
