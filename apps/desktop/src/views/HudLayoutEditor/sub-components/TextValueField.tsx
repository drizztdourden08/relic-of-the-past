/* @layer renderer-components @kind component */
import { Box, Field, Pressable, TextInput } from '@drizztdourden08/tessera/primitives';
import { useTextValue } from '@app/hud-layout-editing/useTextValue';
import { ValueInputFeedback, readFormula, usePromoteOverlay } from './ValueInput';
import type { TextValueFieldProps } from './TextValueField.type';

const TextValueField = (props: TextValueFieldProps) => {
  const { value, onChange, scope, insideRepeat = false } = props;
  const field = useTextValue({ value, onChange });
  const promote = usePromoteOverlay(field.focused, field.formula, field.inputRef);
  const reading = readFormula({ expr: field.expr, scope, insideRepeat });
  const { problem } = reading;

  return (
    <Field
      size="sm"
      label="value"
      error={problem?.message}
      className={`hud-value-field${promote.className}`}
    >
      <Box className="hud-value-input hud-value-field__row" data-formula={field.formula ? 'true' : undefined}>
        <TextInput
          ref={field.inputRef}
          size="sm"
          spellCheck={false}
          className={`hud-value-input__field${problem ? ' is-invalid' : ''}`}
          aria-label="Text"
          placeholder="text, or = formula"
          value={field.text}
          onChange={(event) => field.handleChange(event.target.value)}
          onFocus={field.handleFocus}
          onBlur={field.handleBlur}
          onKeyDown={(event) => field.handleKeyDown(event.key, () => event.preventDefault())}
        />
        {field.focused && !field.formula && (
          <Pressable
            className="hud-value-input__chip"
            title="Drive this from the game, or type ="
            aria-label="Write a formula"
            onMouseDown={(event) => event.preventDefault()}
            onClick={field.startFormula}
          >=</Pressable>
        )}
      </Box>

      <ValueInputFeedback
        formula={field.formula}
        expr={field.expr}
        reading={reading}
        scope={scope}
        insideRepeat={insideRepeat}
        onChange={onChange}
      />
    </Field>
  );
};

export { TextValueField };
export type { TextValueFieldProps } from './TextValueField.type';
