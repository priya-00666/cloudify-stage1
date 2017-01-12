/**
 * Created by kinneretzin on 07/09/2016.
 */

import Topology from './Topology';
import DataFetcher from './DataFetcher';

let getConfig = (widgetConfig,id) =>{
    var conf = widgetConfig ? _.find(widgetConfig,{id:id}) : {};
    return (conf && conf.value === 'true');
};

Stage.addPlugin({
    id: 'topology',
    name: "Topology",
    description: 'Shows topology (blueprint or deployment)',
    initialWidth: 8,
    initialHeight: 4,
    color: "yellow",
    isReact: true,
    hasTemplate: true,
    initialConfiguration: [
        {id: "pollingTime", default: 2},
        {id: 'enableNodeClick', name: 'Enable node click', default:true, type: Stage.Basic.Field.BOOLEAN_TYPE},
        {id: 'enableGroupClick', name: 'Enable group click', default:true, type: Stage.Basic.Field.BOOLEAN_TYPE},
        {id: 'enableZoom', name: 'Enable zoom', default:true, type: Stage.Basic.Field.BOOLEAN_TYPE},
        {id: 'enableDrag', name: 'Enable drag', default:true, type: Stage.Basic.Field.BOOLEAN_TYPE},
        {id: 'showToolbar', name: 'Show toolbar', default:true, type: Stage.Basic.Field.BOOLEAN_TYPE}
    ],

    fetchData: function(plugin,toolbox) {
        var deploymentId = toolbox.getContext().getValue('deploymentId');
        var blueprintId = toolbox.getContext().getValue('blueprintId');

        return DataFetcher.fetch(toolbox,blueprintId,deploymentId);
    },

    render: function(widget,data,error,toolbox) {
        if (!widget.plugin.template) {
            return 'Topology: missing template';
        }

        var topologyConfig = {
            enableNodeClick: widget.configuration.enableNodeClick,
            enableGroupClick: widget.configuration.enableGroupClick,
            enableZoom: widget.configuration.enableZoom,
            enableDrag: widget.configuration.enableDrag,
            showToolbar: widget.configuration.showToolbar
        };

        var topologyTemplate = _.template(widget.plugin.template)(topologyConfig);
        var deploymentId = toolbox.getContext().getValue('deploymentId');
        var blueprintId = toolbox.getContext().getValue('blueprintId');

        var formattedData = Object.assign({},data,{
            deploymentId,
            blueprintId,
            topologyConfig
        });
        return <Topology template={topologyTemplate} widget={widget} data={formattedData} toolbox={toolbox}/>;

    }

});