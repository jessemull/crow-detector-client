/// <reference types="cypress" />

describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the main heading', () => {
    cy.get('h1').should('contain', 'Critter Canteen');
  });

  it('should display the description text', () => {
    cy.get('p').should(
      'contain',
      'IoT-powered crow feeding and imaging station'
    );
  });

  it('should show feeder and camera status indicators', () => {
    cy.get('[data-testid="feeder-status"]').should('exist');
    cy.get('[data-testid="camera-status"]').should('exist');
  });

  it('should display the feed button', () => {
    cy.get('button').should('contain', 'Feed the Crows');
  });
});
