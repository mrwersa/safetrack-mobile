// ***********************************************************
// This support/e2e.ts is processed and loaded automatically before your test files.
//
// This is a great place to put global configuration and behavior
// that modifies Cypress.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';

// Ionic apps use shadow DOM for inputs and other elements
// We need to ensure we can interact with these elements
// https://docs.cypress.io/api/commands/shadow

// Don't fail the test immediately if the assertion fails 
// This gives the single-page app time to load
const resizeObserverLoopErrRe = /^[^(ResizeObserver loop limit exceeded)]/;
Cypress.on('uncaught:exception', (err) => {
  if (resizeObserverLoopErrRe.test(err.message)) {
    return false;
  }
  // We still want to ensure other errors are logged
  return true;
});