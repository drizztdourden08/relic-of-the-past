/* @layer renderer-components @kind component */
import { Box, TextInput } from '@drizztdourden08/tessera/primitives';
import { ValueChips } from './ValueChips';
import { ValueSpin } from './ValueSpin';
import type { ValueInputRowProps } from './ValueInputRow.type';

const nameOf = (ariaLabel: string | undefined, label: string | undefined, fallback: string): string =>
  ariaLabel ?? label ?? fallback;

const ValueInputRow = (props: ValueInputRowProps) => {
  const { field, label, ariaLabel, placeholder, readOnly, invalid } = props;

  return (
    <Box className="hud-value-input hud-value-field__row" data-formula={field.formula ? 'true' : undefined}>
      <TextInput
        ref={field.inputRef}
        size="sm"
        inputMode={field.canStep ? 'decimal' : 'text'}
        spellCheck={false}
        readOnly={readOnly}
        className={`hud-value-input__field${invalid ? ' is-invalid' : ''}`}
        aria-label={nameOf(ariaLabel, label, 'Value')}
        placeholder={placeholder ?? 'number, or = formula'}
        value={field.text}
        onChange={(event) => field.handleChange(event.target.value, event.target.selectionStart ?? 0)}
        onFocus={field.handleFocus}
        onBlur={field.handleBlur}
        onKeyDown={(event) => field.handleKeyDown(event.key, () => event.preventDefault())}
      />
      {field.canStep && !readOnly && <ValueSpin named={nameOf(ariaLabel, label, 'value')} stepBy={field.stepBy} />}
      {!readOnly && <ValueChips field={field} />}
    </Box>
  );
};

export { ValueInputRow };
