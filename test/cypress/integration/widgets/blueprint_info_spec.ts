describe('Blueprint Info widget', () => {
    const blueprintName = 'blueprints_info_test';

    before(() =>
        cy
            .activate('valid_trial_license')
            .usePageMock('blueprintInfo')
            .mockLogin()
            .deleteBlueprints(blueprintName, true)
            .uploadBlueprint('blueprints/empty.zip', blueprintName)
    );

    it('should show message when no blueprint selected', () => {
        cy.get('.blueprintInfoWidget .message').should('contain.text', 'No blueprint selected');
    });

    it('should show blueprint information when blueprint selected', () => {
        cy.setBlueprintContext(blueprintName);

        cy.get('.blueprintInfoWidget').within(() => {
            cy.log('Verifying blueprint name');
            cy.contains(blueprintName);

            cy.log('Verifying blueprint creator');
            cy.get('div:nth-child(5)').within(() => {
                cy.get('.header').should('have.text', 'Creator');
                cy.get('div:nth-child(2)').should('have.text', 'admin');
            });

            cy.log('Verifying main blueprint file name');
            cy.get('div:nth-child(6)').within(() => {
                cy.get('.header').should('have.text', 'Main Blueprint File');
                cy.get('div:nth-child(2)').should('have.text', 'blueprint.yaml');
            });

            cy.log('Verifing deployments count');
            cy.get('div:nth-child(7)').within(() => {
                cy.get('.header').should('have.text', 'Deployments');
                cy.get('div:nth-child(2)').should('have.text', '0');
            });
        });
    });
});
