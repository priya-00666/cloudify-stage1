import type { Visibility } from 'app/widgets/common/types';
import { isNil, omitBy } from 'lodash';

export default class SiteActions {
    toolbox: Stage.Types.WidgetlessToolbox;

    constructor(toolbox: Stage.Types.WidgetlessToolbox) {
        this.toolbox = toolbox;
    }

    doDelete(name: string) {
        return this.toolbox.getManager().doDelete(`/sites/${name}`);
    }

    doCreate(name: string, visibility: Visibility, location: string) {
        return this.toolbox.getManager().doPut(`/sites/${name}`, { body: { location, visibility } });
    }

    doUpdate(
        name: string,
        visibility: Visibility | null,
        location: string | null = null,
        newName: string | null = null
    ) {
        const body = omitBy({ location, visibility, new_name: newName }, isNil);
        return this.toolbox.getManager().doPost(`/sites/${name}`, { body });
    }
}
