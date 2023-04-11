import { chain, find, capitalize, map } from 'lodash';
import type { DropdownItemProps } from 'semantic-ui-react';
import type { FetchedWorkflow, EnhancedWorkflow, SimplifiedWorkflowParameter } from './RunWorkflowModal.types';

const getWorkflowOptionText = (workflow: EnhancedWorkflow) => {
    return capitalize(workflow.name.replaceAll('_', ' '));
};

export const getWorkflowOptions = (workflows: EnhancedWorkflow[]): DropdownItemProps[] => {
    type OptionsGroupName = 'enabledOptions' | 'disabledOptions';
    type GroupedOptions = Partial<Record<OptionsGroupName, DropdownItemProps[]>>;

    const { enabledOptions = [], disabledOptions = [] } = chain(workflows)
        .filter(workflow => !find(workflow.parameters, parameter => parameter.default === undefined))
        .sortBy('name')
        .map(workflow => ({
            text: getWorkflowOptionText(workflow),
            value: workflow.name,
            disabled: workflow.disabled
        }))
        .groupBy((workflow): OptionsGroupName => {
            return workflow.disabled ? 'disabledOptions' : 'enabledOptions';
        })
        .value() as GroupedOptions;

    return [...enabledOptions, ...disabledOptions];
};

const mapFetchedWorkflowParameters = (
    workflowParameters: FetchedWorkflow['parameters']
): SimplifiedWorkflowParameter[] => {
    return map(workflowParameters, (parameterFields, parameterName) => ({
        ...parameterFields,
        name: parameterName,
        required: parameterFields.default !== undefined
    }));
};

const filterSupportedWorkflowParameters = (
    workflowParameters: EnhancedWorkflow['parameters']
): EnhancedWorkflow['parameters'] => {
    const supportedParameterTypes = ['string', 'integer', 'float', 'boolean', 'list', 'textarea'];

    const filteredWorkflowParameters = workflowParameters.filter(
        parameter => parameter.type === undefined || supportedParameterTypes.includes(parameter.type as string)
    );

    return filteredWorkflowParameters;
};

// TODO Norbert: Add note to PR about the reason behind doing mapping first (from performance POV it's not the best) - the reason is DX and not having a need of doing additional, complicated Array.prototype.reduce operations
export const initializeWorkflowParameters = (
    workflowParameters: FetchedWorkflow['parameters']
): SimplifiedWorkflowParameter[] => {
    return filterSupportedWorkflowParameters(mapFetchedWorkflowParameters(workflowParameters));
};
