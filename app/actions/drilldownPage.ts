import _ from 'lodash';
import { setDrilldownContext } from './drilldownContext';
import { addLayoutToPage } from './page';
import { createDrilldownPage, selectPage } from './pageMenu';
import type { TemplatePageDefinition } from './templateManagement/pages';
import { setDrillDownWarningActive } from './templateManagement/pages';
import type { PayloadAction, ReduxThunkAction } from './types';
import { ActionType } from './types';
import type { Widget } from '../utils/StageAPI';

export type AddDrilldownPageAction = PayloadAction<
    { widgetId: string; drillDownPageName: string; drillDownPageId: string; parentPageId?: string },
    ActionType.ADD_DRILLDOWN_PAGE
>;
export type DrilldownPageAction = AddDrilldownPageAction;

export function addWidgetDrilldownPage(
    widgetId: string,
    drillDownPageName: string,
    drillDownPageId: string
): AddDrilldownPageAction {
    return {
        type: ActionType.ADD_DRILLDOWN_PAGE,
        payload: {
            widgetId,
            drillDownPageId,
            drillDownPageName
        }
    };
}

export function drillDownToPage(
    widget: Widget<unknown>,
    defaultTemplate: TemplatePageDefinition,
    drilldownContext: Record<string, any>,
    drilldownPageName: string
): ReduxThunkAction<void> {
    return async (dispatch, getState) => {
        const isTemplateManagement = _.get(getState().templateManagement, 'isActive');
        if (isTemplateManagement) {
            return dispatch(setDrillDownWarningActive(true));
        }

        let pageId = widget.drillDownPages[defaultTemplate.name];
        if (!pageId) {
            const currentPage = _.replace(window.location.pathname, /.*\/page\//, '');
            const newPageId = _.snakeCase(`${currentPage} ${defaultTemplate.name}`);
            const isDrilldownPagePresent = !!_.find(getState().pages, { id: newPageId });

            if (!isDrilldownPagePresent) {
                dispatch(createDrilldownPage(defaultTemplate, newPageId));
                await dispatch(addLayoutToPage(defaultTemplate, newPageId));
            }

            dispatch(addWidgetDrilldownPage(widget.id, defaultTemplate.name, newPageId));
            pageId = newPageId;
        }

        // Refresh the drilldown context for the current page
        const updatedDrilldownContext = getState().drilldownContext.slice();
        const currentPageDrilldownContext = updatedDrilldownContext.pop() || {};
        updatedDrilldownContext.push({
            ...currentPageDrilldownContext,
            context: getState().context
        });
        dispatch(setDrilldownContext(updatedDrilldownContext));

        return dispatch(selectPage(pageId, true, drilldownContext, drilldownPageName));
    };
}
