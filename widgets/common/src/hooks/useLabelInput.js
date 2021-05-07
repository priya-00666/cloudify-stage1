const allowedCharacters = /^[a-z][a-z0-9._-]*$/i;
const maxInputLength = 256;

function useLabelInput(onChange, { allowAnyValue = false, initialValue = '' }) {
    const { useBoolean, useResettableState } = Stage.Hooks;
    const [inputValue, setInputValue, resetInputValue] = useResettableState(initialValue);
    const [invalidCharacterTyped, setInvalidCharacterTyped, unsetInvalidCharacterTyped] = useBoolean();

    return {
        inputValue,
        invalidCharacterTyped,
        submitChange: (event, data) => {
            if (allowAnyValue) {
                onChange(data.value);
                resetInputValue();
                return;
            }

            // supports both dropdown as well as regular input
            const lowercasedNewTypedValue = _.toLower(data.searchQuery ?? data.value).substr(0, maxInputLength);
            if (lowercasedNewTypedValue === '' || allowedCharacters.test(lowercasedNewTypedValue)) {
                setInputValue(lowercasedNewTypedValue);
                onChange(lowercasedNewTypedValue);
                unsetInvalidCharacterTyped();
            } else {
                setInvalidCharacterTyped();
            }
        },
        resetInput: () => {
            resetInputValue();
            onChange(initialValue);
            if (!allowAnyValue) unsetInvalidCharacterTyped();
        },
        unsetInvalidCharacterTyped
    };
}

Stage.defineHook({ useLabelInput });