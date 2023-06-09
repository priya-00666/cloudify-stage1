import type { FunctionComponent } from 'react';
import type { Toolbox } from 'app/utils/StageAPI';
import type { ButtonConfiguration } from 'app/widgets/common/configuration/buttonConfiguration';
import CreateEnvironmentModal from './CreateEnvironmentModal';

const translateMenu = Stage.Utils.getT('widgets.environmentButton.menu');

interface EnvironmentButtonProps {
    toolbox: Toolbox;
    configuration: ButtonConfiguration;
    disabled?: boolean;
}

const EnvironmentButton: FunctionComponent<EnvironmentButtonProps> = ({ configuration, toolbox, disabled }) => {
    const { useBoolean } = Stage.Hooks;
    const [fromBlueprintModalOpen, openFromBlueprintModal, closeFromBlueprintModal] = useBoolean();
    const [createNewModalOpen, openCreateNewModal, closeCreateNewModal] = useBoolean();

    const { Dropdown, Button, Icon } = Stage.Basic;
    const { DeployBlueprintModal } = Stage.Common;
    return (
        <>
            <Dropdown
                fluid
                icon={null}
                disabled={disabled}
                trigger={
                    <Button fluid color={configuration.color} basic={configuration.basic} icon labelPosition="left">
                        {configuration.label}
                        <Icon name={configuration.icon} />
                        <span>
                            <Icon name="dropdown" style={{ float: 'right' }} />
                        </span>
                    </Button>
                }
            >
                <Dropdown.Menu style={{ width: '100%' }}>
                    <Dropdown.Item onClick={openCreateNewModal}>{translateMenu('new')}</Dropdown.Item>
                    <Dropdown.Item onClick={openFromBlueprintModal}>{translateMenu('fromBlueprint')}</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            <DeployBlueprintModal
                open={fromBlueprintModalOpen}
                onHide={closeFromBlueprintModal}
                toolbox={toolbox}
                blueprintFilterRules={[Stage.Common.Filters.environmentFilterRule]}
            />
            {createNewModalOpen && <CreateEnvironmentModal toolbox={toolbox} onHide={closeCreateNewModal} />}
        </>
    );
};

export default EnvironmentButton;
