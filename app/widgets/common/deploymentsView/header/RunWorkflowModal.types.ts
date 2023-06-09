import type { fetchedWorkflowFields } from './RunWorkflowModal.consts';
import type { Workflow } from '../../executeWorkflow';

export type FetchedWorkflow = Pick<Workflow, typeof fetchedWorkflowFields[number]>;

export type SimplifiedWorkflowParameter = FetchedWorkflow['parameters'][string] & {
    required: boolean;
    name: string;
};

export interface EnhancedWorkflow extends Omit<FetchedWorkflow, 'parameters'> {
    disabled: boolean;
    parameters: SimplifiedWorkflowParameter[];
}

export type ParameterInputs = Record<string, unknown>;
