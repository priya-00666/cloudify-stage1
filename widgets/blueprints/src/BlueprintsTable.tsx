import BlueprintState from './BlueprintState';
import type { BlueprintsViewProps } from './types';
import { translateBlueprints } from './widget.utils';

const translateBlueprintsIcons = Stage.Utils.composeT(translateBlueprints, 'icons');
const translateBlueprintsColumns = Stage.Utils.composeT(translateBlueprints, 'columns');

export default function BlueprintsTable({
    data,
    fetchData,
    noDataMessage,
    onCreateDeployment,
    onDeleteBlueprint,
    onSelectBlueprint,
    onSetVisibility,
    toolbox,
    widget
}: BlueprintsViewProps) {
    const { DataTable, Icon, ResourceVisibility, Label } = Stage.Basic;
    const { hasComposerPermission } = Stage.Utils;
    const { Blueprints } = Stage.Common;
    const { allowedVisibilitySettings } = Stage.Common.Consts;
    const manager = toolbox.getManager();
    const tableName = 'blueprintsTable';
    const { fieldsToShow } = widget.configuration;

    return (
        <DataTable
            fetchData={fetchData}
            totalSize={data.total}
            pageSize={widget.configuration.pageSize}
            sortColumn={widget.configuration.sortColumn}
            sortAscending={widget.configuration.sortAscending}
            selectable
            searchable
            className={tableName}
            noDataMessage={noDataMessage}
        >
            <DataTable.Column label={translateBlueprintsColumns('name')} name="id" width="20%" />
            <DataTable.Column
                show={fieldsToShow?.includes('Created')}
                label={translateBlueprintsColumns('created')}
                name="created_at"
                width="15%"
            />
            <DataTable.Column
                show={fieldsToShow?.includes('Updated')}
                label={translateBlueprintsColumns('updated')}
                name="updated_at"
                width="15%"
            />
            <DataTable.Column
                show={fieldsToShow?.includes('Creator')}
                label={translateBlueprintsColumns('creator')}
                name="created_by"
                width="15%"
            />
            <DataTable.Column label={translateBlueprintsColumns('main_file_name')} name="main_file_name" width="15%" />
            <DataTable.Column
                show={fieldsToShow?.includes('State')}
                label={translateBlueprintsColumns('state')}
                name="state"
            />
            <DataTable.Column
                show={fieldsToShow?.includes('Deployments')}
                label={translateBlueprintsColumns('deployments')}
            />
            <DataTable.Column width="10%" />

            {data.items.map(item => (
                <DataTable.Row
                    id={`${tableName}_${item.id}`}
                    key={item.id}
                    selected={item.isSelected}
                    onClick={Blueprints.Actions.isUploaded(item) ? () => onSelectBlueprint(item) : undefined}
                >
                    <DataTable.Data
                        style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}
                    >
                        <span>
                            {Blueprints.Actions.isUploaded(item) && (
                                <Blueprints.UploadedImage
                                    blueprintId={item.id}
                                    tenantName={manager.getSelectedTenant()}
                                    width={25}
                                />
                            )}{' '}
                            <a className="blueprintName" href="#!" style={{ marginLeft: '5px' }}>
                                {item.id}
                            </a>
                        </span>
                        <ResourceVisibility
                            visibility={item.visibility}
                            onSetVisibility={visibility => onSetVisibility(item.id, visibility)}
                            allowedSettingTo={allowedVisibilitySettings}
                            className="rightFloated"
                        />
                    </DataTable.Data>
                    <DataTable.Data>{item.created_at}</DataTable.Data>
                    <DataTable.Data>{item.updated_at}</DataTable.Data>
                    <DataTable.Data>{item.created_by}</DataTable.Data>
                    <DataTable.Data>{item.main_file_name}</DataTable.Data>
                    <DataTable.Data>
                        <BlueprintState blueprint={item} />
                    </DataTable.Data>
                    <DataTable.Data>
                        <Label color="green" horizontal>
                            {item.depCount}
                        </Label>
                    </DataTable.Data>

                    <DataTable.Data textAlign="center" className="rowActions">
                        {Blueprints.Actions.isCompleted(item) && (
                            <>
                                {Blueprints.Actions.isUploaded(item) && (
                                    <>
                                        {!manager.isCommunityEdition() &&
                                            widget.configuration.showComposerOptions &&
                                            hasComposerPermission(toolbox.getManagerState()) && (
                                                <Icon
                                                    name="external share"
                                                    title={translateBlueprintsIcons('editInComposer')}
                                                    onClick={(event: Event) => {
                                                        event.stopPropagation();
                                                        new Stage.Common.Blueprints.Actions(toolbox).doEditInComposer(
                                                            item.id,
                                                            item.main_file_name
                                                        );
                                                    }}
                                                />
                                            )}
                                        <Icon
                                            name="rocket"
                                            link
                                            title={translateBlueprintsIcons('createDeployment')}
                                            onClick={(event: Event) => {
                                                event.stopPropagation();
                                                onCreateDeployment(item);
                                            }}
                                        />
                                    </>
                                )}
                                <Icon
                                    name="trash"
                                    link
                                    title={translateBlueprintsIcons('deleteBlueprint')}
                                    onClick={(event: Event) => {
                                        event.stopPropagation();
                                        onDeleteBlueprint(item);
                                    }}
                                />
                            </>
                        )}
                    </DataTable.Data>
                </DataTable.Row>
            ))}
        </DataTable>
    );
}
