import type { DateRangeInputOnChangeData, DateRangeInputProps, DateRange } from 'cloudify-ui-components';
import type { DropdownItemProps, DropdownProps, InputProps } from 'semantic-ui-react';
import { map, keys, pick, sortBy, every, debounce, truncate, isEqual } from 'lodash';

const contextValueKey = 'eventFilter';
const refreshEvent = 'eventsFilter:refresh';

const translate = Stage.Utils.getT('widgets.eventsFilter.inputs');

interface Fields {
    eventType: string[];
    timeRange: DateRange;
    timeStart: string | moment.Moment;
    timeEnd: string | moment.Moment;
    type: string;
    messageText: string;
    operationText: string;
    logLevel: string[];
}

const initialFields: Fields = Object.freeze({
    eventType: [],
    timeRange: Stage.Basic.DateRangeInput.EMPTY_VALUE,
    timeStart: '',
    timeEnd: '',
    type: '',
    messageText: '',
    operationText: '',
    logLevel: []
});

const { Utils: EventUtils } = Stage.Common.Events;

const defaultEventTypeOptions = sortBy(
    map(keys(EventUtils.eventTypeOptions), event => ({
        ...pick(EventUtils.eventTypeOptions[event], ['text']),
        value: event
    })),
    event => event.text
);

const defaultLogLevelOptions = map(keys(EventUtils.logLevelOptions), log => ({
    ...pick(EventUtils.logLevelOptions[log], ['text', 'icon']),
    value: log
}));

function isDirty(fields: Fields) {
    return !every(
        initialFields,
        (_value, name) => fields[name as keyof Fields] === initialFields[name as keyof Fields]
    );
}

const debouncedContextUpdate = debounce((toolbox, fields) => {
    toolbox.getContext().setValue(contextValueKey, fields);
}, 500);

function EventFilter({ toolbox }: { toolbox: Stage.Types.Toolbox }) {
    const { useState, useEffect } = React;
    const { useEventListener } = Stage.Hooks;

    const [fields, setFields] = useState<Fields>(toolbox.getContext().getValue('eventFilter') || initialFields);
    const [options, setOptions] = useState({ eventType: defaultEventTypeOptions, logLevel: defaultLogLevelOptions });
    const [dirty, setDirty] = useState(isDirty(fields));

    useEventListener(toolbox, refreshEvent, () =>
        setFields({ ...initialFields, ...toolbox.getContext().getValue(contextValueKey) })
    );

    useEffect(() => setDirty(isDirty(fields)), [JSON.stringify(fields)]);

    function renderLabel(data: DropdownItemProps) {
        return truncate(data.text as string, { length: 30 });
    }

    const handleInputChange: InputProps['onChange'] & DateRangeInputProps['onChange'] & DropdownProps['onChange'] = (
        _event,
        field
    ) => {
        const updatedFields = { ...fields, [field.name]: field.value };
        if (field.name === 'timeRange') {
            const { value } = field as DateRangeInputOnChangeData;
            const emptyStartValue = !value.start;
            const emptyEndValue = !value.end;

            updatedFields.timeStart = emptyStartValue ? '' : moment(value.start);
            updatedFields.timeEnd = emptyEndValue ? '' : moment(value.end);
        }

        if (field.name === 'type') {
            if (field.value === EventUtils.logType) {
                updatedFields.eventType = [];
            } else if (field.value === EventUtils.eventType) {
                updatedFields.logLevel = [];
            }
        }

        if (field.name === 'logLevel') {
            updatedFields.eventType = [];
        }

        if (field.name === 'eventType') {
            updatedFields.logLevel = [];
        }

        setFields(updatedFields);
        debouncedContextUpdate(toolbox, updatedFields);
    };

    const handleOptionAddition: DropdownProps['onAddItem'] = (_event, data) => {
        const { name, value } = data;
        setOptions({ ...options, [name]: [{ text: value, value }, ...options[name as keyof typeof options]] });
    };

    function resetFilter() {
        setDirty(false);
        setFields(initialFields);
        toolbox.getContext().setValue('eventFilter', initialFields);
        toolbox.getEventBus().trigger('events:refresh');
    }

    function isTypeSet(type: string) {
        return !fields.type || fields.type === type;
    }

    const { Form, Popup, DateRangeInput } = Stage.Basic;

    const timeRanges = {
        'Last 15 Minutes': {
            start: moment().subtract(15, 'minutes').format(DateRangeInput.DATETIME_FORMAT),
            end: ''
        },
        'Last 30 Minutes': {
            start: moment().subtract(30, 'minutes').format(DateRangeInput.DATETIME_FORMAT),
            end: ''
        },
        'Last Hour': {
            start: moment().subtract(1, 'hours').format(DateRangeInput.DATETIME_FORMAT),
            end: ''
        },
        'Last 2 Hours': {
            start: moment().subtract(2, 'hours').format(DateRangeInput.DATETIME_FORMAT),
            end: ''
        },
        'Last Day': {
            start: moment().subtract(1, 'days').format(DateRangeInput.DATETIME_FORMAT),
            end: ''
        },
        'Last Week': {
            start: moment().subtract(1, 'weeks').format(DateRangeInput.DATETIME_FORMAT),
            end: ''
        }
    };

    return (
        <Form size="small">
            <Form.Group inline widths="equal">
                <Form.Field>
                    <Form.Dropdown
                        placeholder={translate('type.placeholder')}
                        fluid
                        selection
                        options={EventUtils.typesOptions}
                        name="type"
                        value={fields.type}
                        onChange={handleInputChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Form.Dropdown
                        placeholder={translate('eventType.placeholder')}
                        fluid
                        multiple
                        search
                        selection
                        options={options.eventType}
                        name="eventType"
                        renderLabel={renderLabel}
                        additionLabel={translate('eventType.additionLabel')}
                        value={fields.eventType}
                        allowAdditions
                        disabled={!isTypeSet(EventUtils.eventType)}
                        onAddItem={handleOptionAddition}
                        onChange={handleInputChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Form.Dropdown
                        placeholder={translate('logLevel.placeholder')}
                        fluid
                        multiple
                        search
                        selection
                        options={options.logLevel}
                        name="logLevel"
                        allowAdditions
                        disabled={!isTypeSet(EventUtils.logType)}
                        additionLabel={translate('logLevel.additionLabel')}
                        value={fields.logLevel}
                        onAddItem={handleOptionAddition}
                        onChange={handleInputChange}
                    />
                </Form.Field>
                <Form.Field>
                    <Popup
                        trigger={<Form.Button icon="undo" basic onClick={resetFilter} disabled={!dirty} />}
                        content={translate('resetFilter.content')}
                    />
                </Form.Field>
            </Form.Group>
            <Form.Group inline widths="equal">
                <Form.Input
                    placeholder={translate('operationText.placeholder')}
                    name="operationText"
                    fluid
                    value={fields.operationText}
                    onChange={handleInputChange}
                />
                <Form.Input
                    placeholder={translate('messageText.placeholder')}
                    name="messageText"
                    fluid
                    value={fields.messageText}
                    onChange={handleInputChange}
                />
                <Form.Field>
                    <Form.DateRange
                        placeholder={translate('timeRange.placeholder')}
                        name="timeRange"
                        ranges={timeRanges}
                        defaultValue={DateRangeInput.EMPTY_VALUE}
                        value={fields.timeRange}
                        onChange={handleInputChange}
                    />
                </Form.Field>
            </Form.Group>
        </Form>
    );
}

export default React.memo(EventFilter, isEqual);
