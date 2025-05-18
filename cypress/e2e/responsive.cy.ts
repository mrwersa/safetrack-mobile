describe('Mobile Responsiveness Tests', () => {
  // Test a subset of common viewport sizes for mobile devices
  const viewports = [
    { width: 375, height: 667, name: 'iPhone SE' },
    { width: 414, height: 896, name: 'iPhone 11' },
    { width: 360, height: 740, name: 'Android (Medium)' }
  ];

  viewports.forEach((viewport) => {
    describe(`Testing on ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
      beforeEach(() => {
        // Set viewport size for this test
        cy.viewport(viewport.width, viewport.height);
      });

      it('should display the login page correctly', () => {
        cy.visit('/login');
        // Verify basic elements are visible at this viewport size
        cy.get('ion-title').should('be.visible');
        cy.get('ion-button').should('be.visible');
        // Verify form is properly displayed
        cy.get('ion-card').should('be.visible');
      });

      describe('Authenticated views', () => {
        beforeEach(() => {
          // Setup mock authentication directly using localStorage
          cy.clearLocalStorage();
          cy.window().then(win => {
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

        it('should display home page correctly', () => {
          cy.visit('/home');
          // Check basic responsive elements
          cy.get('ion-title').should('be.visible');
          cy.get('ion-card').should('be.visible');
          cy.get('ion-button').should('be.visible');
        });
      });
    });
  });
});