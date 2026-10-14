/* @layer renderer-components @kind component */
import './ValueInput.css';
import { Field } from '@drizztdourden08/tessera/primitives';
import { readFormula } from './behavior/read-formula';
import { usePromoteOverlay } from './behavior/usePromoteOverlay';
import { valueErrorOf } from './behavior/value-error-of';
import { useValueInput } from './behavior/useValueInput';
import { FormulaMenu } from './sub-components/FormulaMenu';
import { ValueInputFeedback } from './sub-components/ValueInputFeedback';
import { ValueInputRow } from './sub-components/ValueInputRow';
import type { ValueInputProps } from './ValueInput.type';

const ValueInput = (props: ValueInputProps) => {
  const {
    label, value, onChange, onClear, scope, insideRepeat = false, extraNames, role = 'number',
    min, max, step = 1, placeholder, hint, readOnly = false, derivedFrom,
    className = '', 'aria-label': ariaLabel,
  } = props;

  const field = useValueInput({ value, onChange, onClear, step, min, max });
  const reading = readFormula({ expr: field.expr, scope, insideRepeat, extraNames });
  const promote = usePromoteOverlay(field.focused, field.formula, field.inputRef);
  const error = valueErrorOf(reading, field);

  return (
    <Field
      size="sm"
      label={label}
      hint={hint ?? (readOnly ? derivedFrom : undefined)}
      error={error}
      className={`hud-value-field ${className}${promote.className}`}
    >
      <ValueInputRow
        field={field}
        label={label}
        ariaLabel={ariaLabel}
        placeholder={placeholder}
        readOnly={readOnly}
        invalid={error !== undefined}
      />
      <ValueInputFeedback
        formula={field.formula}
        expr={field.expr}
        reading={reading}
        scope={scope}
        insideRepeat={insideRepeat}
        min={min}
        max={max}
        onChange={onChange}
      />
      <FormulaMenu
        open={field.menuOpen}
        anchorRef={field.inputRef}
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
