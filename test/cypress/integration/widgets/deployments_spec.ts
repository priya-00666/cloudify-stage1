import ExecutionUtils from 'app/utils/shared/ExecutionUtils';
import type { Deployment } from 'widgets/deployments/src/types';
import { exampleBlueprintUrl } from '../../support/resource_urls';

describe('Deployments widget', () => {
    const widgetId = 'deployments';
    const blueprintName = 'deployments_test_hw';
    const deploymentId = 'deployments_test_hw_dep';
    const deploymentName = `${deploymentId}_name`;
    const siteName = 'Zakopane';
    const site = { name: siteName };
    const blueprintUrl = exampleBlueprintUrl;

    const selectDeploymentActionFromMenu = (id: string, name: string, menuClassName: string, action: string) => {
        cy.searchInDeploymentsWidget(id);
        cy.contains('div.row', name).find(menuClassName).click();
        cy.get('.popupMenu > .menu').contains(action).click();
    };
    const executeDeploymentAction = (id: string, name: string, action: string) => {
        selectDeploymentActionFromMenu(id, name, '.deploymentActionsMenu', action);
    };
    const executeDeploymentWorkflow = (id: string, name: string, workflow: string) => {
        selectDeploymentActionFromMenu(id, name, '.workflowsMenu', workflow);
    };
    const verifyExecutionHasEnded = (workflow: string) => cy.waitForExecutionToEnd(workflow, { deploymentId });
    const checkDeploymentNameField = () =>
        cy.get('.deploymentSegment h3 [aria-label="Deployment name"]').should('have.text', deploymentName);

    before(() => {
        cy.activate('valid_trial_license')
            .deleteSites(siteName)
            .deleteDeployments(deploymentId, true)
            .deleteBlueprints(blueprintName, true)
            .uploadBlueprint(blueprintUrl, blueprintName)
            .deployBlueprint(blueprintName, deploymentId, { webserver_port: 9123 }, { display_name: deploymentName })
            .createSite(site)
            .usePageMock('deployments', {
                pollingTime: 5,
                clickToDrillDown: true,
                showExecutionStatusLabel: false
            })
            .mockLogin();
    });

    describe('should be present and', () => {
        it('should allow to search by depyloyment ID', () => {
            cy.searchInDeploymentsWidget(deploymentId);
            checkDeploymentNameField();
        });

        it('should allow to search by deployment name', () => {
            cy.searchInDeploymentsWidget(deploymentName);
            checkDeploymentNameField();
        });
    });

    describe('should allow to', () => {
        beforeEach(() => {
            cy.refreshPage();
        });

        it('set site for deployment', () => {
            cy.interceptSp('POST', `/deployments/${deploymentId}/set-site`).as('setDeploymentSite');

            executeDeploymentAction(deploymentId, deploymentName, 'Set Site');

            cy.get('.modal').within(() => {
                cy.contains(`Set the site of deployment ${deploymentName} (${deploymentId})`);
                cy.get('div[name="siteName"]').click();
                cy.get(`div[option-value="${siteName}"]`).click();
                cy.get('button.ok').click();
            });

            cy.wait('@setDeploymentSite');
            cy.contains('div.row', deploymentId)
                .find('div.column:nth-child(2) h5:nth-child(2) .sub.header')
                .should('have.text', siteName);
        });

        it('update deployment', () => {
            const anotherBlueprintName = `${blueprintName}_another`;
            cy.uploadBlueprint('blueprints/input_types.zip', anotherBlueprintName, { yamlFile: 'string_type.yaml' });

            cy.interceptSp('POST', `/deployment-updates/${deploymentId}/update/initiate`).as('updateDeployment');

            cy.interceptSp('GET', { pathname: '/blueprints', query: { state: 'uploaded' } }).as('uploadedBlueprints');
            executeDeploymentAction(deploymentId, deploymentName, 'Update');

            cy.get('.updateDeploymentModal').within(() => {
                cy.contains(`Update deployment ${deploymentName} (${deploymentId})`);

                cy.setSearchableDropdownValue('Blueprint', anotherBlueprintName);

                cy.getField('string_constraint_pattern').find('input').should('have.value', 'Ubuntu 18.04');

                cy.get('div[name=blueprintName]').click();
                cy.contains(RegExp(`${blueprintName}$`)).click();

                cy.get('textarea[name="webserver_port"]').clear({ force: true }).type('9321');
                cy.contains('Skip heal').click();
                cy.contains('Skip drift check').click();
                cy.clickButton('Preview');
            });

            cy.get('.updateDetailsModal').within(() => {
                cy.contains('tr', 'webserver_port').within(() => {
                    cy.get('td:nth-child(2)').should('have.text', '9123');
                    cy.get('td:nth-child(3)').should('have.text', '9321');
                });
                cy.clickButton('Update');
            });

            cy.wait('@updateDeployment').then(({ request }) => {
                expect(request.body).to.deep.equal({
                    blueprint_id: blueprintName,
                    force: false,
                    ignore_failure: false,
                    inputs: { webserver_port: 9321 },
                    install_first: false,
                    preview: true,
                    reinstall_list: [],
                    skip_drift_check: true,
                    skip_heal: true,
                    skip_install: false,
                    skip_reinstall: false,
                    skip_uninstall: false
                });
            });
            cy.get('.updateDetailsModal').should('not.exist');
            verifyExecutionHasEnded(ExecutionUtils.UPDATE_WORKFLOW_ID);
            cy.contains('div.row', deploymentId)
                .get('div.column:nth-child(3) h5:nth-child(2)')
                .should('contain.text', 'Updated');
        });

        it('deploy blueprint on environment', () => {
            const environmentBlueprintName = `${blueprintName}_deploy_on_environment`;
            const environmentDeploymentName = `${deploymentId}_deploy_on_environment`;
            const childDeploymentName = `${environmentDeploymentName}_child_service`;
            const suggestedBlueprint = `${blueprintName}_deploy_on_suggested_blueprint`;
            const notSuggestedBlueprint = `${blueprintName}_deploy_on_not_suggested_blueprint`;

            const typeValueToDynamicDropdown = (value: string) => {
                cy.get('input').click().clear().type(value);
            };

            const checkIfBlueprintIsSuggested = (blueprint: string, shouldBeSuggested: boolean) => {
                const listHeader = shouldBeSuggested ? 'Suggested' : 'Others';

                cy.contains('.header', listHeader).next().should('have.text', blueprint);
            };

            cy.uploadBlueprint('blueprints/deploy_on_with_suggestion.zip', suggestedBlueprint);
            cy.uploadBlueprint('blueprints/deploy_on_without_suggestion.zip', notSuggestedBlueprint);
            cy.uploadBlueprint('blueprints/deploy_on_environment.zip', environmentBlueprintName).deployBlueprint(
                environmentBlueprintName,
                environmentDeploymentName
            );

            executeDeploymentAction(environmentDeploymentName, environmentDeploymentName, 'Deploy On');

            cy.get('.modal').within(() => {
                cy.getField('Blueprint').within(() => {
                    typeValueToDynamicDropdown(notSuggestedBlueprint);
                    checkIfBlueprintIsSuggested(notSuggestedBlueprint, false);

                    typeValueToDynamicDropdown(suggestedBlueprint);
                    checkIfBlueprintIsSuggested(suggestedBlueprint, true);

                    cy.contains(suggestedBlueprint).click();
                });

                cy.typeToFieldInput('Deployment name', childDeploymentName);
                cy.clickButton('Install');
            });

            cy.get('.modal').should('not.exist');
            cy.contains('.breadcrumb', childDeploymentName);
        });

        it('manage deployment labels', () => {
            const labelKey = 'test-key';
            const labelValue = 'test-value';

            cy.setLabels(deploymentId, [{ a: 'b' }]);
            cy.interceptSp('PATCH', `/deployments/${deploymentId}`).as('updateLabels');
            cy.interceptSp('GET', { path: `/deployments/${deploymentId}?_include=labels` }).as('fetchLabels');

            executeDeploymentAction(deploymentId, deploymentName, 'Manage Labels');
            cy.get('.modal').within(() => {
                cy.contains(`Manage labels for deployment ${deploymentName} (${deploymentId})`);
                cy.wait('@fetchLabels');
                cy.get('form.loading').should('not.exist');

                cy.get('.segment.dropdown').click();
                cy.addLabel(labelKey, labelValue);
                cy.get('button.ok').click();
            });
            cy.wait('@updateLabels');

            cy.getDeployment(deploymentId).then(response => {
                const { labels } = response.body;
                const verifyLabel = (index: number, key: string, value: string) => {
                    expect(labels[index]).to.have.property('key', key);
                    expect(labels[index]).to.have.property('value', value);
                };

                expect(labels).to.have.length(2);
                verifyLabel(0, 'a', 'b');
                verifyLabel(1, labelKey, labelValue);
            });
        });

        it('remove deployment', () => {
            const testDeploymentId = `${deploymentId}_remove_id`;
            const testDeploymentName = `${deploymentId}_remove_name`;
            cy.deployBlueprint(blueprintName, testDeploymentId, {}, { display_name: testDeploymentName });
            cy.interceptSp('DELETE', { path: `/deployments/${testDeploymentId}?force=true` }).as('deleteDeployment');

            executeDeploymentAction(testDeploymentId, testDeploymentName, 'Force Delete');

            cy.contains(
                `Are you sure you want to ignore the live nodes and delete the deployment ${testDeploymentName} (${testDeploymentId})?`
            );
            cy.get('.modal button.primary').click();

            cy.wait('@deleteDeployment');
            cy.contains('div.row', testDeploymentId).should('not.exist');
        });
    });

    describe('should provide display configuration for', () => {
        before(cy.refreshPage);

        it('clickToDrillDown option', () => {
            cy.searchInDeploymentsWidget(deploymentId);
            cy.get('.deploymentsWidget').contains(deploymentName).click({ force: true });
            cy.location('pathname').should('contain', '_deployment/deployments_test_hw_dep');
            cy.contains('.breadcrumb', 'deployments_test_hw_dep');

            cy.refreshPage();
            cy.setBooleanConfigurationField(widgetId, 'Enable click to drill down', false);

            cy.get('.deploymentsWidget').contains(deploymentName).click();
            cy.location('pathname').should('not.contain', '_deployment/deployments_test_hw_dep');
            cy.get('.deploymentsWidget');
        });

        it('showExecutionStatusLabel option', () => {
            cy.searchInDeploymentsWidget(deploymentId);

            const latestExecutionCellSelector = 'tr#deploymentsTable_deployments_test_hw_dep td:nth-child(3)';
            cy.get(latestExecutionCellSelector).within(() => {
                cy.get('.icon').should('be.visible');
                cy.get('.label').should('not.exist');
            });

            cy.setBooleanConfigurationField(widgetId, 'Show execution status label', true);

            cy.searchInDeploymentsWidget(deploymentId);
            cy.get(latestExecutionCellSelector).within(() => {
                cy.get('.icon').should('be.visible');
                cy.get('.label').should('be.visible');
            });
            cy.getSearchInput().clear().blur();
        });

        describe('showFirstUserJourneyButtons option and', () => {
            before(() => {
                cy.setBooleanConfigurationField(widgetId, 'Show first user journey buttons', true);
            });

            beforeEach(() => {
                cy.visitTestPage();
            });

            const getMockedResponse = (deployments: unknown[] = []) => ({
                items: deployments,
                metadata: {
                    pagination: {
                        total: deployments.length,
                        size: 1000,
                        offset: 0
                    },
                    filtered: 0
                }
            });

            const mockDeploymentsResponse = (mockedResponse: any) =>
                cy.interceptSp('GET', '/deployments*', mockedResponse);

            it('should display showFirstUserJourneyButtons view when there are no deployments', () => {
                const mockedResponse = getMockedResponse([]);
                mockDeploymentsResponse(mockedResponse);

                cy.contains('No Deployments Yet').should('be.visible');

                // TODO: RND-292 - remove as part of dedicated ticket once confirmed
                // cy.contains('Upload from Terraform').click();
                // cy.contains('Create blueprint from Terraform')
                //     .parent()
                //     .within(() => {
                //         cy.contains('button', 'Cancel').click();
                //     });
                // cy.contains('button', 'Yes').click();

                cy.contains('Create new Deployment').click();
                cy.contains('Blueprint Marketplace').should('be.visible');
            });

            it("should hide showFirstUserJourneyButtons view when there's at least one deployment", () => {
                const displayName = 'deploymentDisplayName';
                const mockedDeployment: Deployment = {
                    blueprint_id: 'test',
                    created_at: '2022-03-21T08:52:31.251Z',
                    created_by: 'admin',
                    display_name: displayName,
                    id: 'ea2d9302-6452-4f51-a224-803925d2cc6e',
                    inputs: { webserver_port: 8000 },
                    latest_execution: '28f3fada-118c-4236-9987-576b0efae71e',
                    labels: [],
                    site_name: null,
                    updated_at: '2022-03-21T08:52:31.251Z',
                    workflows: [],
                    visibility: 'tenant',
                    capabilities: {}
                };
                const mockedResponse = getMockedResponse([mockedDeployment]);
                mockDeploymentsResponse(mockedResponse);

                cy.contains(displayName).should('be.visible');
                cy.contains('No Deployments Yet').should('not.exist');
            });
        });

        it('blueprintIdFilter option', () => {
            cy.interceptSp('GET', { pathname: '/deployments', query: { blueprint_id: blueprintName } }).as(
                'getFilteredDeployments'
            );

            cy.editWidgetConfiguration('deployments', () =>
                cy.get('input[name="blueprintIdFilter"]').clear().type(blueprintName)
            );

            cy.wait('@getFilteredDeployments');
        });

        it('displayStyle option', () => {
            cy.get('table.deploymentsTable').should('be.visible');
            cy.get('div.segmentList').should('not.exist');

            cy.editWidgetConfiguration('deployments', () => {
                cy.get('div[name="displayStyle"]').click();
                cy.get('div[option-value="list"]').click();
            });

            cy.get('table.deploymentsTable').should('not.exist');
            cy.get('div.segmentList').should('be.visible');
        });
    });

    describe('to execute', () => {
        const startAndVerifyWorkflowExecution = (workflow: string) => {
            cy.get('.executeWorkflowModal').within(() => {
                cy.contains(`Execute workflow ${workflow} on ${deploymentName} (${deploymentId})`);
                cy.get('button.ok').click();
            });
            verifyExecutionHasEnded(workflow);
        };

        it('install workflow from deployment actions menu', () => {
            executeDeploymentAction(deploymentId, deploymentName, 'Install');
            startAndVerifyWorkflowExecution('install');
        });

        it('a workflow from workflows menu', () => {
            executeDeploymentWorkflow(deploymentId, deploymentName, 'Restart');
            startAndVerifyWorkflowExecution('restart');
        });
    });
});
