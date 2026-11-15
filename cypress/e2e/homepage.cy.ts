/// <reference types="cypress" />

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the main heading', () => {
    cy.get('h1').should('contain', 'Critter Canteen');
  });

  it('should describe the feeder and shelter', () => {
    cy.get('p').should(
      'contain',
      'Crows eat from an automated feeder. A heated shelter stays open for whoever else stops by.'
    );
  });

  it('should show a disabled Feeder control', () => {
    cy.get('button').contains('Feeder').should('be.disabled');
  });

  it('should link to Shelter Cam', () => {
    cy.get('a').contains('Shelter Cam').should('have.attr', 'href', '/porch');
  });
});

describe('About page', () => {
  beforeEach(() => {
    cy.visit('/about');
  });

  it('should display the about heading', () => {
    cy.get('h1').should('contain', 'Wildlife care, engineered end to end.');
  });

  it('should link back home', () => {
    cy.get('a').contains('Back to Home').should('have.attr', 'href', '/');
  });
});
