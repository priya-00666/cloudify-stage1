import type { InstallMethod } from './types';

interface InstallMethodsOption {
    text: string;
    name: string;
    value: InstallMethod;
}

export const installMethodsOptions: InstallMethodsOption[] = [
    { text: 'Remote', name: 'Remote', value: 'remote' },
    { text: 'Plugin', name: 'Plugin', value: 'plugin' },
    { text: 'Init Script', name: 'Init Script', value: 'init_script' },
    { text: 'Provided', name: 'Provided', value: 'provided' }
];
