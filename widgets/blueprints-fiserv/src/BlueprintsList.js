/**
 * Created by kinneretzin on 02/10/2016.
 */

import BlueprintsTable from './BlueprintsTable';
import BlueprintsCatalog from './BlueprintsCatalog';
import DeployBlueprintModal from './DeployBlueprintModal';

export default class BlueprintList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            showDeploymentModal: false,
            showUploadModal: false,
            blueprintId: '',
            confirmDelete: false,
            error: null,
            force: false
        };
    }

    shouldComponentUpdate(nextProps, nextState) {
        return (
            !_.isEqual(this.props.widget, nextProps.widget) ||
            !_.isEqual(this.state, nextState) ||
            !_.isEqual(this.props.data, nextProps.data)
        );
    }

    _selectBlueprint(item) {
        if (this.props.widget.configuration.clickToDrillDown) {
            this.props.toolbox.drillDown(this.props.widget, 'blueprint', { blueprintId: item.id }, item.id);
        } else {
            const oldSelectedBlueprintId = this.props.toolbox.getContext().getValue('blueprintId');
            this.props.toolbox
                .getContext()
                .setValue('blueprintId', item.id === oldSelectedBlueprintId ? null : item.id);
        }
    }

    _createDeployment(item) {
        this.setState({ error: null, blueprintId: item.id, showDeploymentModal: true });
    }

    _deleteBlueprintConfirm(item) {
        this.setState({ confirmDelete: true, blueprintId: item.id, force: false });
    }

    _deleteBlueprint() {
        if (!this.state.blueprintId) {
            this.setState({ error: 'Something went wrong, no blueprint was selected for delete' });
            return;
        }

        const actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        this.setState({ confirmDelete: false });
        actions
            .doDelete(this.state.blueprintId, this.state.force)
            .then(() => {
                this.setState({ error: null });
                this.props.toolbox.refresh();
            })
            .catch(err => {
                this.setState({ error: err.message });
            });
    }

    _setBlueprintVisibility(blueprintId, visibility) {
        const actions = new Stage.Common.BlueprintActions(this.props.toolbox);
        this.props.toolbox.loading(true);
        actions
            .doSetVisibility(blueprintId, visibility)
            .then(() => {
                this.props.toolbox.loading(false);
                this.props.toolbox.refresh();
            })
            .catch(err => {
                this.props.toolbox.loading(false);
                this.setState({ error: err.message });
            });
    }

    _refreshData() {
        this.props.toolbox.refresh();
    }

    componentDidMount() {
        this.props.toolbox.getEventBus().on('blueprints:refresh', this._refreshData, this);
    }

    componentWillUnmount() {
        this.props.toolbox.getEventBus().off('blueprints:refresh', this._refreshData);
    }

    _hideDeploymentModal() {
        this.setState({ showDeploymentModal: false });
    }

    _showUploadModal() {
        this.setState({ showUploadModal: true });
    }

    _hideUploadModal() {
        this.setState({ showUploadModal: false });
    }

    _handleForceChange(event, field) {
        this.setState(Stage.Basic.Form.fieldNameValue(field));
    }

    fetchGridData(fetchParams) {
        return this.props.toolbox.refresh(fetchParams);
    }

    render() {
        const NO_DATA_MESSAGE = 'There are no Blueprints available. Click "Upload" to add Blueprints.';
        const { Button, ErrorMessage } = Stage.Basic;
        const { DeleteConfirm, UploadBlueprintModal } = Stage.Common;

        let properties;
        try {
            properties = JSON.parse(this.props.widget.configuration.properties);
        } catch (e) {
            properties = {};
        }

        return (
            <div>
                <ErrorMessage error={this.state.error} onDismiss={() => this.setState({ error: null })} autoHide />

                <Button
                    content="Upload"
                    icon="upload"
                    labelPosition="left"
                    className="uploadBlueprintButton"
                    onClick={this._showUploadModal.bind(this)}
                />

                <BlueprintsCatalog
                    widget={this.props.widget}
                    data={this.props.data}
                    toolbox={this.props.toolbox}
                    fetchData={this.fetchGridData.bind(this)}
                    onSelectBlueprint={this._selectBlueprint.bind(this)}
                    onDeleteBlueprint={this._deleteBlueprintConfirm.bind(this)}
                    onCreateDeployment={this._createDeployment.bind(this)}
                    onSetVisibility={this._setBlueprintVisibility.bind(this)}
                    noDataMessage={NO_DATA_MESSAGE}
                />

                <DeleteConfirm
                    resourceName={`blueprint ${this.state.blueprintId}`}
                    force={this.state.force}
                    open={this.state.confirmDelete}
                    onConfirm={this._deleteBlueprint.bind(this)}
                    onCancel={() => this.setState({ confirmDelete: false })}
                    onForceChange={this._handleForceChange.bind(this)}
                />

                <DeployBlueprintModal
                    open={this.state.showDeploymentModal}
                    blueprintId={this.state.blueprintId}
                    onHide={this._hideDeploymentModal.bind(this)}
                    toolbox={this.props.toolbox}
                    properties={properties[this.state.blueprintId]}
                />

                <UploadBlueprintModal
                    open={this.state.showUploadModal}
                    onHide={this._hideUploadModal.bind(this)}
                    toolbox={this.props.toolbox}
                />
            </div>
        );
    }
}
