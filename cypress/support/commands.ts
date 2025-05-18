/// <reference types="cypress" />
// ***********************************************
// SafeTrack Mobile custom commands
// ***********************************************

Cypress.Commands.add('login', (username, password) => {
  cy.visit('/login');
  cy.get('ion-input[type="text"]').shadow().find('input').type(username);
  cy.get('ion-input[type="password"]').shadow().find('input').type(password);
  cy.get('ion-button[type="submit"]').click();
  // Wait for the home page to load
  cy.url().should('include', '/home');
});

// Custom command to register a new user
Cypress.Commands.add('register', (userData) => {
  cy.visit('/register');
  
  // Find inputs by label text and their type
  cy.contains('IonLabel', 'Username*').parent().find('ion-input').shadow().find('input').type(userData.username);
  cy.contains('IonLabel', 'Email*').parent().find('ion-input').shadow().find('input').type(userData.email);
  cy.contains('IonLabel', 'Password*').parent().find('ion-input').shadow().find('input').type(userData.password);
  cy.contains('IonLabel', 'Confirm Password*').parent().find('ion-input').shadow().find('input').type(userData.password);
  
  if (userData.firstName) {
    cy.contains('IonLabel', 'First Name').parent().find('ion-input').shadow().find('input').type(userData.firstName);
  }
  
  if (userData.lastName) {
    cy.contains('IonLabel', 'Last Name').parent().find('ion-input').shadow().find('input').type(userData.lastName);
  }
  
  cy.get('ion-button[type="submit"]').click();
});

// Logout command
Cypress.Commands.add('logout', () => {
  cy.visit('/profile');
  cy.contains('Logout').click();
  cy.get('ion-alert').contains('Confirm').click();
  cy.url().should('include', '/login');
});

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>
      register(userData: { 
        username: string; 
        email: string; 
        password: string; 
        firstName?: string; 
        lastName?: string 
      }): Chainable<void>
      logout(): Chainable<void>
    }
  }
}

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Cypress.Commands.overwrite() can be used to
// modify existing commands
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

export {};