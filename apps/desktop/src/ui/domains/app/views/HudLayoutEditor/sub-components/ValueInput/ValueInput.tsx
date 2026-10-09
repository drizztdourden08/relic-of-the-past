/* @layer renderer-components @kind component */
import './ValueInput.css';
import './sub-components/InstanceStrip.css';
import './sub-components/FormulaMenu.css';
import { Box, Field, Icon, Pressable, TextInput } from '@drizztdourden08/tessera/primitives';
import { resolveValue } from '@rotp/hud';
import { readExpr } from '../../behavior/check-expr';
import { useInstanceScopes } from '../../behavior/formula-scope';
import { rangeNote } from './behavior/range-note';
import { usePromoteOverlay } from './behavior/usePromoteOverlay';
import { useValueInput } from './behavior/useValueInput';
import { FormulaFeedback } from './sub-components/FormulaFeedback';
import { FormulaMenu } from './sub-components/FormulaMenu';
import { FormulaProblem } from './sub-components/FormulaProblem';
import { NOT_A_NUMBER } from './ValueInput.constants';
import type { ValueInputProps } from './ValueInput.type';

const ValueInput = (props: ValueInputProps) => {
  const {
    label, value, onChange, onClear, scope, insideRepeat = false, extraNames, role = 'number',
    min, max, step = 1, placeholder, hint, readOnly = false, derivedFrom,
    className = '', 'aria-label': ariaLabel,
  } = props;

  const field = useValueInput({ value, onChange, onClear, step, min, max });
  const named = ariaLabel ?? label ?? 'value';
  const instances = useInstanceScopes();
  const anchorRef = field.inputRef;
  const promote = usePromoteOverlay(field.focused, field.formula, field.inputRef);

  const reading = field.expr === null ? null : readExpr(field.expr, { insideRepeat, extraNames });
  const literalProblem = !field.formula && field.text.trim() !== '' && !field.canStep
    ? NOT_A_NUMBER : undefined;
  const problem = reading?.problem ?? null;

  const result = field.expr === null || problem !== null
    ? null : resolveValue({ from: 'data', expr: field.expr }, scope);

  return (
    <Field
      size="sm"
      label={label}
      hint={hint ?? (readOnly ? derivedFrom : undefined)}
      error={problem?.message ?? literalProblem}
      className={`hud-value-field ${className}${promote.className}`}
    >
      <Box className="hud-value-input hud-value-field__row" data-formula={field.formula ? 'true' : undefined}>
        <TextInput
          ref={field.inputRef}
          size="sm"
          inputMode={field.canStep ? 'decimal' : 'text'}
          spellCheck={false}
          readOnly={readOnly}
          className={`hud-value-input__field${(problem ?? literalProblem) ? ' is-invalid' : ''}`}
          aria-label={ariaLabel ?? label ?? 'Value'}
          placeholder={placeholder ?? 'number, or = formula'}
          value={field.text}
          onChange={(event) => field.handleChange(event.target.value, event.target.selectionStart ?? 0)}
          onFocus={field.handleFocus}
          onBlur={field.handleBlur}
          onKeyDown={(event) => field.handleKeyDown(event.key, () => event.preventDefault())}
        />

        {field.canStep && !readOnly && (
          <Box className="hud-value-input__spin">
            <Pressable tabIndex={-1} aria-label={`Increment ${named}`} onClick={() => field.stepBy(1)}>
              <Icon size={12} name="chevron-up" />
            </Pressable>
            <Pressable tabIndex={-1} aria-label={`Decrement ${named}`} onClick={() => field.stepBy(-1)}>
              <Icon size={12} name="chevron-down" />
            </Pressable>
          </Box>
        )}

        {field.focused && !field.formula && !readOnly && (
          <Pressable
            className="hud-value-input__chip"
            title="Drive this from the game, or type ="
            aria-label="Write a formula"
            onMouseDown={(event) => event.preventDefault()}
            onClick={field.startFormula}
          >=</Pressable>
        )}

        {field.formula && !readOnly && (
          <Pressable
            className="hud-value-input__fx"
            aria-label="Insert a name or a formula"
            onMouseDown={(event) => event.preventDefault()}
            onClick={field.openMenu}
          >ƒ ▾</Pressable>
        )}
      </Box>

      {field.formula && problem === null && (
        <FormulaFeedback
          expr={field.expr ?? ''}
          reads={reading?.reads ?? []}
          scope={scope}
          instances={insideRepeat ? instances : []}
          result={result}
          outOfRange={result === null ? undefined : rangeNote(result, min, max)}
        />
      )}

      <FormulaProblem problem={problem} onFix={(expr) => onChange({ from: 'data', expr })} />

      <FormulaMenu
        open={field.menuOpen}
        anchorRef={anchorRef}
        filter={field.prefix}
        role={role}
        insideRepeat={insideRepeat}
        extraNames={extraNames}
        scope={scope}
        onClose={field.closeMenu}
        onInsert={field.insert}
      />
    </Field>
  );
};

export { ValueInput };
