import React from 'react';
import i18n from 'i18next';
import { List, PopupHelp } from '../../../../components/basic';
import ParameterValue from './ParameterValue';

/**
 * ParameterValueDescription is a popup description for ParameterValue component.
 */
export default function ParameterValueDescription() {
    return (
        <PopupHelp
            flowing
            header="Value style"
            content={
                <List>
                    <List.Item>
                        String:
                        <ParameterValue value="centos_core" showCopyButton={false} />,
                        <ParameterValue value="763878b2-67d1-4a8b-9c44-cc3d17625eed" showCopyButton={false} />
                    </List.Item>
                    <List.Item>
                        Boolean:
                        <ParameterValue value showCopyButton={false} />,
                        <ParameterValue value={false} showCopyButton={false} />
                    </List.Item>
                    <List.Item>
                        Number:
                        <ParameterValue value={623946} showCopyButton={false} />,
                        <ParameterValue value={3.14} showCopyButton={false} />
                    </List.Item>
                    <List.Item>
                        Object:
                        <ParameterValue
                            value={{
                                sku: '14.04.5-LTS',
                                publisher: 'Canonical',
                                version: 'latest',
                                offer: 'UbuntuServer'
                            }}
                            showCopyButton={false}
                        />
                    </List.Item>
                    <List.Item>
                        Array:
                        <ParameterValue value={['node_f73mxd', 'vm_32jdfg', 'host_f92mv7']} showCopyButton={false} />
                    </List.Item>
                    <List.Item>
                        Link:&nbsp;&nbsp;
                        <ParameterValue
                            value={i18n.t('widgets.common.urls.linkParameterExample')}
                            showCopyButton={false}
                        />
                    </List.Item>
                    <List.Item>
                        Null:
                        <ParameterValue value={null} showCopyButton={false} />
                    </List.Item>
                </List>
            }
        />
    );
}
