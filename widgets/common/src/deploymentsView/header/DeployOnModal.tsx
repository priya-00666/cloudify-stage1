import type { FunctionComponent } from 'react';
import GenericDeployModal from '../../GenericDeployModal';
import { FilterRule } from '../../filters/types';
import { DeploymentsResponse } from '../types';
import { BlueprintDeployParams } from '../../BlueprintActions';
import { i18nPrefix } from '../common';

interface DeployOnModalProps {
    filterRules: FilterRule[];
    toolbox: Stage.Types.Toolbox;
    onHide: () => void;
}

const headerT = (suffix: string) => Stage.i18n.t(`${i18nPrefix}.header.${suffix}`);

const DeployOnModal: FunctionComponent<DeployOnModalProps> = ({ filterRules, toolbox, onHide }) => {
    function fetchEnvironments() {
        return toolbox
            .getManager()
            .doPostFull('/searches/deployments', { _include: 'id' }, { filter_rules: filterRules })
            .then((response: DeploymentsResponse) => response.items.map(item => item.id));
    }

    function createDeploymentGroup(environements: string[], deploymentParameters: BlueprintDeployParams) {
        return toolbox
            .getManager()
            .doPut(
                `/deployment-groups/BATCH_ACTION_${moment().format('YYYY-MM-DD-HH-mm-ss-SS')}`,
                {},
                {
                    blueprint_id: deploymentParameters.blueprintId,
                    default_inputs: deploymentParameters.inputs,
                    labels: deploymentParameters.labels,
                    visibility: deploymentParameters.visibility,
                    new_deployments: environements.map(environmentId => ({
                        id: `${environmentId}-${deploymentParameters.blueprintId}-{uuid}`,
                        labels: [{ 'csys-obj-parent': environmentId }]
                    }))
                }
            )
            .then((response: { id: string }) => response.id);
    }

    function startInstallWorkflow(deploymentGroupId: string) {
        return toolbox.getManager().doPost(
            '/execution-groups',
            {},
            {
                deployment_group_id: deploymentGroupId,
                workflow_id: 'install'
            }
        );
    }

    function finalize() {
        toolbox.getEventBus().trigger('deployments:refresh');
        onHide();
    }

    return (
        <GenericDeployModal
            toolbox={toolbox}
            open
            onHide={onHide}
            i18nHeaderKey="widgets.deploymentsView.header.bulkActions.deployOn.modal.header"
            deployValidationMessage={headerT('bulkActions.deployOn.modal.steps.validatingData')}
            deployAndInstallSteps={[
                {
                    message: headerT('bulkActions.deployOn.modal.steps.fetchingEnvironments'),
                    executeStep: fetchEnvironments
                },
                {
                    message: headerT('bulkActions.deployOn.modal.steps.creatingDeployments'),
                    executeStep: createDeploymentGroup
                },
                {
                    message: headerT('bulkActions.deployOn.modal.steps.installingDeployments'),
                    executeStep: startInstallWorkflow
                },
                { executeStep: finalize }
            ]}
        />
    );
};

export default DeployOnModal;