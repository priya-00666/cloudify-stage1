import { consts, icons } from 'cloudify-ui-common-frontend';
import type { NodeStatus } from 'cloudify-ui-common-frontend/typings/consts';
import type { NodeInstance } from './widget.types';

const NODE_STATUS = consts.nodeStatuses;

function isInitialized(instance: NodeInstance) {
    return !_.includes(
        ['uninitialized', 'deleting', 'deleted', 'stopping', 'stopped'],
        typeof instance === 'string' ? instance : instance.state
    );
}

export function isCompleted(instance: NodeInstance) {
    return instance && instance.state === 'started';
}

/**
 *
 * @param {NODE_STATUS} nodeStatus
 */
export function getContentByStatus(nodeStatus: NodeStatus) {
    return icons.getNodeStatusIcon(nodeStatus);
}

export function getColorByStatus(nodeStatus: NodeStatus) {
    switch (nodeStatus) {
        case NODE_STATUS.DONE:
            return '#8eaf26';
        case NODE_STATUS.LOADING:
            return '#2f3334';
        case NODE_STATUS.ALERT:
            return '#feb300';
        case NODE_STATUS.FAILED:
            return '#d54931';
        case NODE_STATUS.UNINITIALIZED:
        default:
            return 'white';
    }
}

export function getInstancesCountPerState(instances: NodeInstance[]) {
    return _.countBy(instances, 'state');
}

// an aggregation of all instances
export function getNodeState(inProgress: boolean, instances: NodeInstance[]) {
    let status = inProgress ? NODE_STATUS.LOADING : NODE_STATUS.UNINITIALIZED;

    // if node is not completed when execution is over, the execution is failed. we ignore uninitialized scenario here.
    const failed = _.find(instances, _.negate(isCompleted));
    const completed = _.find(instances, isCompleted);
    const initialized = _.find(instances, isInitialized);

    if (initialized) {
        // did someone even try to install the blueprint?? - if not, there's nothing to talk about
        if (!inProgress) {
            if (!completed) {
                // not even one node is completed. this is a total failure!!!
                status = NODE_STATUS.FAILED;
            } else if (failed) {
                // some are completed. some are failed.. minor failure
                status = NODE_STATUS.ALERT;
            }
        } // else in progress, then status is loading. since it is already set.. we do nothing here..

        // no regardless if in progress or not, if everything is ok, show success
        if (completed && !failed) {
            // if all nodes completed and nothing failed, then everything is working. yey!!!!
            status = NODE_STATUS.DONE;
        }
    }

    return status;
}
