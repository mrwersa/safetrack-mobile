describe('SafeTrack Mobile Tests', () => {
  before(() => {
    // Clear localStorage before tests to remove any auth tokens
    cy.clearLocalStorage();
  });

  // Basic navigation test
  it('should load the login page', () => {
    cy.visit('/');
    // Should redirect to login page
    cy.url().should('include', '/login');
    cy.contains('SafeTrack Login').should('be.visible');
  });

  // Login page elements test
  it('should display login form elements', () => {
    cy.visit('/login');
    // Look for the login form elements by content rather than strict structure
    cy.contains('Login').should('exist');
    cy.contains('Password').should('exist');
    cy.get('ion-button').should('exist');
    cy.contains('Forgot Password').should('exist');
    cy.contains('account').should('exist');
  });

  // Registration page elements test
  it('should navigate to registration page', () => {
    cy.visit('/register');
    cy.url().should('include', '/register');
    // Look for elements on the register page
    cy.get('ion-button').should('exist');
    cy.contains('Password').should('exist');
  });

  // Forgot password navigation test
  it('should navigate to forgot password page', () => {
    cy.visit('/login');
    cy.contains('Forgot Password').click();
    cy.url().should('include', '/forgot-password');
    cy.contains('Reset Password').should('exist');
    cy.contains('Email').should('exist');
    cy.get('ion-button').should('exist');
  });
});

// Separate describe block for authenticated tests
describe('Authenticated SafeTrack Mobile Tests', () => {
  beforeEach(() => {
    // Mock authentication in localStorage to simulate login
    cy.clearLocalStorage();
    cy.window().then((win) => {
      // Store auth data in the format our app expects
      const authData = {
        token: 'fake-jwt-token',
        user: {
          id: '123',
          username: 'testuser',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User'
        }
      };
      win.localStorage.setItem('auth', JSON.stringify(authData));
    });
  });

  // Home page test
  it('should access home page when authenticated', () => {
    cy.visit('/home');
    cy.url().should('include', '/home');
    cy.get('ion-title').should('exist');
  });
  
  // Check if important UI elements are present
  it('should show key navigation elements', () => {
    cy.visit('/home');
    cy.get('ion-title').contains('SafeTrack').should('exist');
    cy.get('ion-button').should('exist');
  });
})