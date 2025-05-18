describe('Emergency Features', () => {
  beforeEach(() => {
    // Mock the API responses
    cy.intercept('GET', '/api/emergency/status', {
      statusCode: 200,
      body: { active: false }
    }).as('getEmergencyStatus');

    cy.intercept('POST', '/api/emergency/activate', {
      statusCode: 200,
      body: { active: true }
    }).as('activateEmergency');

    // Visit the app
    cy.visit('/');
  });

  it('should display emergency cards', () => {
    cy.get('.emergency-card').should('have.length', 3);
    cy.get('.emergency-card.sos').should('exist');
    cy.get('.emergency-card.guide').should('exist');
    cy.get('.emergency-card.contact').should('exist');
  });

  it('should show panic button', () => {
    cy.get('.panic-button').should('exist');
    cy.get('.panic-button-label').should('contain', 'Hold for Emergency');
  });

  it('should show quick actions', () => {
    // Open quick actions
    cy.get('.quick-actions-pull-tab').click();
    cy.get('.quick-actions').should('be.visible');
    cy.get('.quick-action-item').should('have.length', 5);
  });

  it('should activate emergency mode on panic button long press', () => {
    // Trigger long press
    cy.get('.panic-button ion-fab-button')
      .trigger('mousedown')
      .wait(2000)
      .trigger('mouseup');

    // Check if confirmation dialog appears
    cy.get('ion-alert').should('be.visible');
    cy.get('ion-alert').contains('Activate Emergency Mode');

    // Confirm activation
    cy.get('ion-alert .alert-button-confirm').click();

    // Verify API call
    cy.wait('@activateEmergency');

    // Check UI updates
    cy.get('.panic-button-label').should('contain', 'Activating');
    cy.get('ion-toast').should('contain', 'Emergency mode activated');
  });

  it('should handle offline mode', () => {
    // Simulate offline
    cy.window().then((win) => {
      win.navigator.onLine = false;
      win.dispatchEvent(new Event('offline'));
    });

    // Try emergency activation
    cy.get('.panic-button ion-fab-button')
      .trigger('mousedown')
      .wait(2000)
      .trigger('mouseup');

    // Should still show confirmation
    cy.get('ion-alert').should('be.visible');
    cy.get('ion-alert').contains('Activate Emergency Mode');

    // Confirm activation
    cy.get('ion-alert .alert-button-confirm').click();

    // Should show offline message
    cy.get('ion-toast').should('contain', 'Offline mode - Emergency services will be notified when connection is restored');
  });

  it('should handle accessibility features', () => {
    // Check ARIA labels
    cy.get('.panic-button ion-fab-button')
      .should('have.attr', 'aria-label', 'Emergency SOS Button');

    // Check keyboard navigation
    cy.get('.quick-actions-pull-tab').focus().type('{enter}');
    cy.get('.quick-actions').should('be.visible');

    // Check high contrast support
    cy.get('body').then(($body) => {
      // Add forced-colors class to simulate high contrast mode
      $body.addClass('forced-colors');
      
      // Verify high contrast styles are applied
      cy.get('.emergency-card.sos')
        .should('have.css', 'border-color', 'Mark');
    });
  });

  it('should support reduced motion preferences', () => {
    cy.get('body').then(($body) => {
      // Add prefers-reduced-motion class
      $body.addClass('prefers-reduced-motion');
      
      // Verify animations are disabled
      cy.get('.emergency-card.urgent')
        .should('not.have.css', 'animation');
    });
  });
}); 