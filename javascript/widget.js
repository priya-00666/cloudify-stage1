import { get } from 'lodash';
import './widget.css';

Stage.defineWidget({
  id: 'blueprintsWithLabelsWidget',
  name: 'Blueprints With Labels',
  description: 'Displays all blueprints with Labels',
  initialWidth: 100,
  initialHeight: 25,
  isReact: true,
  initialConfiguration: [
    {
      id: 'pageSize',
      default: 5,
      hidden: true,
      type: Stage.Basic.GenericField.NUMBER_TYPE,
    },
    Stage.GenericConfig.SORT_ASCENDING_CONFIG(false),
    Stage.GenericConfig.SORT_COLUMN_CONFIG('id'),
  ],
  permission: Stage.GenericConfig.WIDGET_PERMISSION('blueprints'),
  categories: [Stage.GenericConfig.CATEGORY.BLUEPRINTS],

  async fetchData(widget, toolbox, params) {
    const { manager } = toolbox;
    const result = {
      blueprints: {
        items: [],
        metadata: { pagination: { offset: 0, size: 0, total: 0 } },
      },
      deployments: {
        items: [],
      },
    };

    const blueprintsResponse = await manager.doGet(
      '/blueprints?_include=id,updated_at,created_at,created_by,visibility,main_file_name,state,error,labels',
    );

    result.blueprints = blueprintsResponse;

    const blueprintIds = blueprintsResponse.items.map((item) => item.id);

    const deploymentsResponse = await toolbox
      .getManager()
      .doGetFull('/summary/deployments', {
        _target_field: 'blueprint_id',
        blueprint_id: blueprintIds,
      });

    result.deployments = deploymentsResponse;
    return result;
  },
  render: function (widget, data, error, toolbox) {
    const { DataTable, Label } = Stage.Basic;

    if (_.isEmpty(data)) {
      // Data is not fetched yet, show loading spinner
      return <Stage.Basic.Loading message="Loading data..." />;
    }

    const processedData = processBlueprintsAndDeploymentsData(data);

    const columns = [
      { label: 'Name', name: 'id', width: '20%' },
      { label: 'Created', name: 'createdAt', width: '15%' },
      { label: 'Updated', name: 'updatedAt', width: '15%' },
      { label: 'Main blueprint file', name: 'name', width: '15%' },
      { label: 'State', name: 'state', width: '10%' },
      { label: 'Labels', name: 'labels', width: '20%' },
      { label: 'Deploys', name: 'deploymentsCount', width: '5%' },
    ];

    const rows = processedData.items.map((item) => (
      <DataTable.Row id={item.id} key={item.id}>
        {columns.map((column) =>
          column.name === 'deploymentsCount' ? (
            <DataTable.Data key={column.name}>
              <Label color="green" horizontal>
                {item[column.name]}
              </Label>
            </DataTable.Data>
          ) : (
            <DataTable.Data key={column.name}>
              {item[column.name]}
            </DataTable.Data>
          ),
        )}
      </DataTable.Row>
    ));

    return (
      <DataTable
        fetchData={widget.fetchData}
        totalSize={processedData.total}
        pageSize={widget.configuration.pageSize}
        selectable
        searchable
        noDataMessage="No data found"
      >
        {columns.map((column) => (
          <DataTable.Column
            key={column.name}
            label={column.label}
            name={column.name}
            width={column.width}
          />
        ))}
        {rows}
      </DataTable>
    );
  },
});

function processBlueprintsAndDeploymentsData(data) {
  const blueprintsData = data.blueprints;
  const deploymentData = data.deployments;

  const formattedData = blueprintsData.items.map((blueprint) => {
    const deploymentsCount = deploymentData.items.filter(
      (deployment) => deployment.blueprint_id === blueprint.id,
    ).length;
    return {
      id: blueprint.id,
      name: blueprint.main_file_name,
      createdAt: Stage.Utils.Time.formatTimestamp(blueprint.created_at),
      updatedAt: Stage.Utils.Time.formatTimestamp(blueprint.updated_at),
      state: blueprint.state,
      labels: blueprint.labels.map((i) => i.key + ' : ' + i.value).join(', '),
      deploymentsCount: deploymentsCount || 0,
    };
  });

  return {
    ...blueprintsData,
    items: formattedData,
    total: get(blueprintsData, 'metadata.pagination.total', 0),
  };
}
