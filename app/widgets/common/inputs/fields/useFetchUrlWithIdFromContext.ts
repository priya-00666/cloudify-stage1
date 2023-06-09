import { useCallback, useContext, useMemo } from 'react';
import DeploymentIdContext from '../utils/deploymentIdContext';
import BlueprintIdContext from '../utils/blueprintIdContext';
import getConstraintValueFunction from '../utils/getConstraintValueFunction';
import type { Constraint } from '../types';

export default function useFetchUrlWithIdFromContext(fetchUrl: string, constraints: Constraint[]) {
    const { appendQueryParam } = Stage.Utils.Url;
    const deploymentIdFromContext = useContext(DeploymentIdContext);
    const blueprintIdFromContext = useContext(BlueprintIdContext);

    const hasConstraint = useCallback(
        (constraintName: string) => {
            return !!getConstraintValueFunction(constraints)(constraintName);
        },
        [constraints]
    );

    return useMemo(() => {
        if (!hasConstraint('deployment_id')) {
            if (blueprintIdFromContext) {
                return appendQueryParam(fetchUrl, { blueprint_id: blueprintIdFromContext });
            }

            if (deploymentIdFromContext) {
                return appendQueryParam(fetchUrl, { deployment_id: deploymentIdFromContext });
            }
        }

        return fetchUrl;
    }, [blueprintIdFromContext, deploymentIdFromContext, fetchUrl, constraints]);
}
