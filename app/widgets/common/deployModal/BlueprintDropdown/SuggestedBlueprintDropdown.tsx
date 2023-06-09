import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'cloudify-ui-components';
import type { DropdownProps } from 'semantic-ui-react';
import { useBoolean } from '../../../../utils/hooks';
import { filterBlueprints } from './SuggestedBlueprintDropdown.utils';
import useFetchTrigger from '../useFetchTrigger';
import SearchActions from '../../actions/SearchActions';
import type { FetchedBlueprint, FilteredBlueprints } from './SuggestedBlueprintDropdown.types';
import BlueprintDropdownItemList from './SuggestedBlueprintDropdownItemList';
import type { SuggestedBlueprintDropdownItemListProps } from './SuggestedBlueprintDropdownItemList';
import { defaultBlueprintList } from './BlueprintDropdown.consts';
import type { FilterRule } from '../../filters/types';
import type { FullDeploymentData } from '../../deployments/DeploymentActions';
import { fetchedBlueprintFields } from './SuggestedBlueprintDropdown.consts';

export interface SuggestedBlueprintDropdownProps {
    value: string;
    name: DropdownProps['name'];
    onChange: (blueprintId: string) => void;
    toolbox: Stage.Types.Toolbox;
    filterRules: FilterRule[];
    environmentCapabilities?: FullDeploymentData['capabilities'];
}

const SuggestedBlueprintDropdown = ({
    value,
    name,
    onChange,
    toolbox,
    environmentCapabilities = {},
    filterRules
}: SuggestedBlueprintDropdownProps) => {
    const searchActions = new SearchActions(toolbox);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setLoading, unsetLoading] = useBoolean();
    const [shouldFetchBlueprints, triggerBlueprintsFetching, blockBlueprintsFetching] = useBoolean();
    const [blueprintList, setBlueprintList] = useState<FilteredBlueprints>(defaultBlueprintList);
    const [selectedBlueprint, setSelectedBlueprint] = useState<FetchedBlueprint | undefined>();
    const blurForcingElementRef = useRef<HTMLSpanElement>(null);

    const handleSearchChange: DropdownProps['onSearchChange'] = (_event, data) => {
        setSearchQuery(data.searchQuery);
    };

    const resetSearch = () => {
        setSearchQuery('');
    };

    const forceDropdownBlur = () => {
        blurForcingElementRef.current?.click();
    };

    const fetchBlueprints = () => {
        setLoading();

        searchActions
            .doListBlueprints<keyof FetchedBlueprint>({
                filterRules,
                params: {
                    _search: searchQuery,
                    _include: fetchedBlueprintFields.join(',')
                }
            })
            .then(data => {
                const filteredBlueprints = filterBlueprints(data.items, environmentCapabilities);
                setBlueprintList(filteredBlueprints);
            })
            .finally(() => {
                blockBlueprintsFetching();
                unsetLoading();
            });
    };

    const handleDropdownItemClick: SuggestedBlueprintDropdownItemListProps['onItemClick'] = blueprint => {
        setSelectedBlueprint(blueprint);
        onChange(blueprint.id);
        forceDropdownBlur();
    };

    useEffect(() => {
        if (shouldFetchBlueprints) {
            fetchBlueprints();
        }
    }, [shouldFetchBlueprints]);

    useFetchTrigger(() => {
        triggerBlueprintsFetching();
    }, [searchQuery]);

    return (
        <>
            <Dropdown
                name={name}
                fluid
                loading={isLoading}
                value={value}
                text={selectedBlueprint?.id}
                search
                selection
                selectOnBlur={false}
                onSearchChange={handleSearchChange}
                onBlur={resetSearch}
            >
                <Dropdown.Menu>
                    <BlueprintDropdownItemList
                        blueprints={blueprintList.suggestedBlueprints}
                        onItemClick={handleDropdownItemClick}
                        activeBlueprintId={value}
                        isSuggestedList
                        loading={isLoading}
                    />
                    <BlueprintDropdownItemList
                        blueprints={blueprintList.notSuggestedBlueprints}
                        onItemClick={handleDropdownItemClick}
                        activeBlueprintId={value}
                        loading={isLoading}
                    />
                </Dropdown.Menu>
            </Dropdown>
            {/* NOTE: Purpose of this element is to have a way of forcing dropdown blur when necessery */}
            <span ref={blurForcingElementRef} />
        </>
    );
};

export default SuggestedBlueprintDropdown;
