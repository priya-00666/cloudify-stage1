import React from 'react';
import DynamicDropdown from '../../components/DynamicDropdown';
import type { DynamicDropdownInputFieldProps } from './types';
import useFetchUrlWithIdFromContext from './useFetchUrlWithIdFromContext';
import translateInputs from '../utils/translateInputs';

export default function NodeIdInputField({ name, onChange, toolbox, ...restProps }: DynamicDropdownInputFieldProps) {
    const fetchUrl = useFetchUrlWithIdFromContext('/searches/nodes?_include=id', restProps.constraints);

    return (
        <DynamicDropdown
            name={name}
            placeholder={translateInputs('types.node_id.placeholder')}
            fetchUrl={fetchUrl}
            onChange={newValue => onChange?.(null, { name, value: newValue })}
            toolbox={toolbox}
            {...restProps}
        />
    );
}
