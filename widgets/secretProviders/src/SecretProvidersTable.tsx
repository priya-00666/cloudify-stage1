import { useEffect, useState } from 'react';

import type { FetchParams } from 'app/widgets/common/types';
import { dataSortingKeys, tableRefreshEvent } from './widget.consts';
import { translateSecretProviders } from './widget.utils';
import { SecretProvidersType } from './widget.types';
import type { SecretProvidersWidget } from './widget.types';
import CreateSecretProviderModal from './CreateSecretProviderModal';
import UpdateSecretProviderButton from './UpdateSecretProviderButton';
import RemoveSecretProviderButton from './RemoveSecretProviderButton';

const { DataTable, Dropdown } = Stage.Basic;
const { Time } = Stage.Utils;
const { useBoolean } = Stage.Hooks;
const { Menu, Item } = Dropdown;

const translateTable = Stage.Utils.composeT(translateSecretProviders, 'table');

interface SecretProvidersTableProps {
    configuration: SecretProvidersWidget.Configuration;
    data: SecretProvidersWidget.Data;
    toolbox: Stage.Types.Toolbox;
}

const SecretProvidersTable = ({ configuration, data, toolbox }: SecretProvidersTableProps) => {
    const { pageSize, sortColumn, sortAscending } = configuration;
    const totalSize = data.metadata.pagination.total;
    const [isCreateModalVisible, showCreateModal, hideCreateModal] = useBoolean();
    const [secretProviderType, setSecretProviderTypeType] = useState<SecretProvidersType>();

    const fetchTableData = (fetchParams: FetchParams) => {
        toolbox.refresh(fetchParams);
    };

    const handleCreateMenuItemClick = (type: SecretProvidersType) => {
        setSecretProviderTypeType(type);
        showCreateModal();
    };
    const handleOnSubmit = () => {
        toolbox.refresh();
    };

    useEffect(() => {
        toolbox.getEventBus().on(tableRefreshEvent, fetchTableData);
        return () => toolbox.getEventBus().off(tableRefreshEvent, fetchTableData);
    }, []);

    return (
        <>
            <DataTable
                fetchData={fetchTableData}
                totalSize={totalSize}
                pageSize={pageSize}
                sortColumn={sortColumn}
                sortAscending={sortAscending}
                noDataMessage={translateTable('noSecretProviders')}
            >
                <DataTable.Action>
                    <Dropdown button text={translateSecretProviders('createButton.name')}>
                        <Menu direction="left">
                            <Item
                                text={translateSecretProviders('createButton.options.vault')}
                                onClick={() => handleCreateMenuItemClick(SecretProvidersType.Vault)}
                            />
                        </Menu>
                    </Dropdown>
                </DataTable.Action>

                <DataTable.Column label={translateTable('columns.name')} name={dataSortingKeys.name} />
                <DataTable.Column label={translateTable('columns.type')} name={dataSortingKeys.type} />
                <DataTable.Column label={translateTable('columns.dateCreated')} name={dataSortingKeys.createdAt} />
                <DataTable.Column label={translateTable('columns.dateUpdated')} name={dataSortingKeys.updatedAt} />
                <DataTable.Column label="" width="10%" />

                {data.items.map(secretProvider => (
                    <DataTable.Row key={secretProvider.id}>
                        <DataTable.Data>{secretProvider.name}</DataTable.Data>
                        <DataTable.Data>{secretProvider.type}</DataTable.Data>

                        <DataTable.Data>{Time.formatTimestamp(secretProvider.created_at)}</DataTable.Data>
                        <DataTable.Data>{Time.formatTimestamp(secretProvider.updated_at)}</DataTable.Data>
                        <DataTable.Data textAlign="center">
                            <UpdateSecretProviderButton
                                secretProvider={secretProvider}
                                manager={toolbox.getManager()}
                                onSubmit={handleOnSubmit}
                            />
                            <RemoveSecretProviderButton secretProvider={secretProvider} toolbox={toolbox} />
                        </DataTable.Data>
                    </DataTable.Row>
                ))}
            </DataTable>
            {isCreateModalVisible && secretProviderType && (
                <CreateSecretProviderModal
                    onClose={hideCreateModal}
                    manager={toolbox.getManager()}
                    secretProviderType={secretProviderType}
                    onSubmit={handleOnSubmit}
                />
            )}
        </>
    );
};

export default SecretProvidersTable;
