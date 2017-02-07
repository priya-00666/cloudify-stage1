/**
 * Created by pawelposel on 07/11/2016.
 */

import InputsTable from './InputsTable';

Stage.defineWidget({
    id: 'inputs',
    name: 'Deployment Inputs',
    description: 'This widget shows the deployment inputs',
    initialWidth: 8,
    initialHeight: 16,
    color : "teal",
    isReact: true,
    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(2)
    ],

    fetchData: function(widget,toolbox) {
        let deploymentId = toolbox.getContext().getValue('deploymentId');

        if (deploymentId) {
            return toolbox.getManager().doGet(`/deployments?_include=id,inputs&id=${deploymentId}`)
                .then(data=>Promise.resolve({inputs: _.get(data, "items[0].inputs", {})}));
        }
        return Promise.resolve({inputs:{}});
    },

    render: function(widget,data,error,toolbox) {
        if (_.isEmpty(data)) {
            return <Stage.Basic.Loading/>;
        }

        let formattedData = Object.assign({},data,{
            items: Object.keys(data.inputs).map(function(key) {
                return {name: key, value: data.inputs[key]};
                }),
            deploymentId : toolbox.getContext().getValue('deploymentId')
        });

        return (
            <InputsTable data={formattedData} toolbox={toolbox}/>
        );
    }
});