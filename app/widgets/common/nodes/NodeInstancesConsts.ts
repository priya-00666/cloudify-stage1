import type { GroupState } from '../components/GroupState';

const groupNames = {
    uninitialized: 'uninitialized',
    inProgress: 'in progress',
    started: 'started',
    deleted: 'deleted'
};

export const groupStates: (GroupState & { states: string[]; colorHTML: string })[] = [
    {
        name: groupNames.uninitialized,
        icon: 'cancel',
        colorSUI: 'blue',
        colorHTML: '#2185d0',
        states: ['uninitialized']
    },
    {
        name: groupNames.inProgress,
        icon: 'spinner',
        colorSUI: 'yellow',
        colorHTML: '#fbbd08',
        states: [
            'initializing',
            'creating',
            'created',
            'configuring',
            'configured',
            'starting',
            'stopping',
            'stopped',
            'deleting'
        ]
    },
    {
        name: groupNames.started,
        icon: 'checkmark',
        colorSUI: 'green',
        colorHTML: '#21ba45',
        states: ['started']
    },
    {
        name: groupNames.deleted,
        icon: 'trash',
        colorSUI: 'black',
        colorHTML: '#1b1c1d',
        states: ['deleted']
    }
];

export type InstanceSummaryItem = {
    /* eslint-disable camelcase */
    'by state': { state: string; node_instances: number }[];
    deployment_id: string;
    node_instances: number;
    /* eslint-enable camelcase */
};

/**
 * Extracts states from node instances summary item
 *
 * @param {object} instancesSummaryItem - item received from /summary/node_instances REST API,
 * should have the following format:
 * {
 *  'by state': [{state: "started", node_instances: 4, {state: "deleted", node_instances: 2}, ... }],
 *  deployment_id: "nodecellar",
 *  node_instances: 4
 * }
 *
 * @returns {object} states in the following format { "started": 4, "deleted": 2, ... }
 */
function extractStatesFrom(instancesSummaryItem: InstanceSummaryItem) {
    return _.reduce(
        instancesSummaryItem['by state'],
        (result: Record<string, number>, state) => {
            result[state.state] = state.node_instances;
            return result;
        },
        {}
    );
}

/**
 * Extracts number of node instances from node instances summary item
 *
 * @param {object} instancesSummaryItem - item received from /summary/node_instances REST API,
 * should have the following format:
 * {
 *  'by state': [{state: "started", node_instances: 4, {state: "deleted", node_instances: 2}, ... }],
 *  deployment_id: "nodecellar",
 *  node_instances: 4
 * }
 *
 * @returns {number} number of node instances
 */
function extractCountFrom(instancesSummaryItem: InstanceSummaryItem) {
    return _.get(instancesSummaryItem, 'node_instances', 0);
}

export default { extractCountFrom, extractStatesFrom, groupNames, groupStates };
