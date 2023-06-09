export {};

Stage.defineWidget({
    id: 'serversNum',
    name: 'Number of nodes',
    description: 'Number of nodes',
    initialWidth: 2,
    initialHeight: 8,
    showHeader: false,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('serversNum'),
    categories: [Stage.GenericConfig.CATEGORY.CHARTS_AND_STATISTICS],

    initialConfiguration: [Stage.GenericConfig.POLLING_TIME_CONFIG(30)],
    fetchUrl: '[manager]/node-instances?state=started&_include=id&_sort=deployment_id&_size=1',

    render(_widget, data) {
        const { Loading } = Stage.Basic;

        if (_.isEmpty(data)) {
            return <Loading />;
        }

        const num = _.get(data, 'metadata.pagination.total', 0);
        const { KeyIndicator } = Stage.Basic;

        return <KeyIndicator title="Nodes" icon="server" number={num} />;
    }
});
