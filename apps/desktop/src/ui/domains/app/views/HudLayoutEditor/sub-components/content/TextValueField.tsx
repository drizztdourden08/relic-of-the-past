/* @layer renderer-components @kind component */
import { Box, Field, Pressable, TextInput } from '@drizztdourden08/tessera/primitives';
import { resolveValue } from '@rotp/hud';
import { readExpr } from '../../behavior/check-expr';
import { useInstanceScopes } from '../../behavior/formula-scope';
import { useTextValue } from '../../behavior/useTextValue';
import { FormulaFeedback, FormulaProblem, usePromoteOverlay } from '../ValueInput';
import type { TextValueFieldProps } from './TextValueField.type';

const TextValueField = (props: TextValueFieldProps) => {
  const { value, onChange, scope, insideRepeat = false } = props;
  const field = useTextValue({ value, onChange });
  const instances = useInstanceScopes();
  const promote = usePromoteOverlay(field.focused, field.formula, field.inputRef);

  const reading = field.expr === null ? null : readExpr(field.expr, { insideRepeat });
  const problem = reading?.problem ?? null;
  const result = field.expr === null || problem !== null
    ? null : resolveValue({ from: 'data', expr: field.expr }, scope);

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

      {field.formula && problem === null && (
        <FormulaFeedback
          expr={field.expr ?? ''}
          reads={reading?.reads ?? []}
          scope={scope}
          instances={insideRepeat ? instances : []}
          result={result}
        />
      )}
      <FormulaProblem problem={problem} onFix={(expr) => onChange({ from: 'data', expr })} />
    </Field>
  );
};

export { TextValueField };
export type { TextValueFieldProps } from './TextValueField.type';
