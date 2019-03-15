/**
 * Created by jakub.niezgoda on 15/03/2019.
 */

import React from 'react';

export default function ProductVersion({version = ''}) {
    const versionMatches = version.match(/^(\d+)\.(\d+).*$/);
    const major = !!versionMatches && _.size(versionMatches) >= 2 ? versionMatches[1] : '';
    const minor = !!versionMatches && _.size(versionMatches) >= 3 ? versionMatches[2] : '';
    const shortVersion = `${major}${minor ? `.${minor}` : ''}`;

    return <span style={{color: '#0077fc', verticalAlign: 'middle'}}> {shortVersion}</span>
}