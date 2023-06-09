import type { FunctionComponent } from 'react';
import React from 'react';
import DeployBlueprintModal from '../deployModal/DeployBlueprintModal';
import type { GenericDeployModalProps } from '../deployModal/GenericDeployModal';
import ExecuteWorkflowModal from '../executeWorkflow/ExecuteWorkflowModal';
import ManageLabelsModal from '../labels/ManageLabelsModal';
import type { FullDeploymentData } from './DeploymentActions';
import { actions } from './DeploymentActionsMenu.consts';
import RemoveDeploymentModal from './RemoveDeploymentModal';
import SetSiteModal from './SetSiteModal';
import UpdateDeploymentModal from './UpdateDeploymentModal';

export interface DeploymentActionsModalsProps {
    activeAction: string;
    deploymentId: string;
    deploymentName: string;
    deploymentCapabilities: FullDeploymentData['capabilities'];
    onHide: () => void;
    toolbox: Stage.Types.Toolbox;
    redirectToParentPageAfterDelete: boolean;
}

const DeploymentActionsModals: FunctionComponent<DeploymentActionsModalsProps> = ({
    activeAction,
    deploymentId,
    deploymentName,
    deploymentCapabilities,
    onHide,
    toolbox,
    redirectToParentPageAfterDelete
}) => {
    const commonProps = { deploymentId, deploymentName, open: true, onHide, toolbox };
    const environmentToDeployOn: GenericDeployModalProps['environmentToDeployOn'] = {
        id: deploymentId,
        displayName: deploymentName,
        capabilities: deploymentCapabilities
    };

    switch (activeAction) {
        case actions.manageLabels:
            return <ManageLabelsModal {...commonProps} />;
        case actions.install:
        case actions.uninstall:
            return <ExecuteWorkflowModal {...commonProps} workflow={activeAction} />;
        case actions.update:
            return <UpdateDeploymentModal {...commonProps} />;
        case actions.delete:
        case actions.forceDelete:
            return (
                <RemoveDeploymentModal
                    {...commonProps}
                    force={activeAction === actions.forceDelete}
                    redirectToParentPageAfterDelete={redirectToParentPageAfterDelete}
                />
            );
        case actions.deployOn:
            return (
                <DeployBlueprintModal
                    i18nHeaderKey="widgets.deploymentActionButtons.modals.deployOn.header"
                    environmentToDeployOn={environmentToDeployOn}
                    {...commonProps}
                />
            );
        case actions.setSite:
            return <SetSiteModal {...commonProps} />;
        default:
            return null;
    }
};

export default DeploymentActionsModals;
