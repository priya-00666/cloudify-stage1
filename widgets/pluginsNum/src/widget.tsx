import React from 'react';
import type { PollingTimeConfiguration } from 'app/utils/GenericConfig';

const widgetId = 'pluginsNum';
const translate = Stage.Utils.getT(`widgets.${widgetId}`);

interface WidgetConfiguration extends PollingTimeConfiguration {
    page: string;
}

type WidgetData = Stage.Types.PaginatedResponse<{
    id: string;
}>;

Stage.defineWidget<never, WidgetData, WidgetConfiguration>({
    id: widgetId,
    initialWidth: 2,
    initialHeight: 8,
    showHeader: false,
    hasReadme: true,
    permission: Stage.GenericConfig.WIDGET_PERMISSION('pluginsNum'),
    categories: [Stage.GenericConfig.CATEGORY.CHARTS_AND_STATISTICS],

    initialConfiguration: [
        Stage.GenericConfig.POLLING_TIME_CONFIG(30),
        {
            id: 'page',
            name: translate('configuration.page.name'),
            description: translate('configuration.page.description'),
            type: Stage.Basic.GenericField.CUSTOM_TYPE,
            default: 'plugins',
            component: Stage.Shared.PageFilter
        }
    ],
    fetchUrl: '[manager]/plugins?_include=id&_size=1',

    render(widget, data) {
        const { Loading, KeyIndicator } = Stage.Basic;
        const { Link } = Stage.Shared;

        if (Stage.Utils.isEmptyWidgetData(data)) {
            return <Loading />;
        }

        const pluginsCount = data.metadata.pagination.total;
        const redirectionLink = widget.configuration.page ? `/page/${widget.configuration.page}` : '/';

        return (
            <Link to={redirectionLink}>
                <KeyIndicator title={translate('quantityDescription')} icon="plug" number={pluginsCount} />
            </Link>
        );
    }
});
