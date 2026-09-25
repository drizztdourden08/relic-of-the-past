/* @layer renderer-components @kind component */
/**
 * ONE always-typed field, in place of the `123 | ƒx` mode switch that used to
 * prefix every number in this panel. `24` stays a number; `= life_current / 8`
 * is a formula; the leading `=` is how a person SAYS "formula" and is never
 * stored (`behavior/value-text.ts`).
 *
 * NO CHIP AT REST. Someone editing `gap: 2` pays nothing for a feature they are
 * not using. There is no switch, no chip, no border colour, no hint. The affordance is
 * rented, not owned: the `=` button appears on FOCUS, on the focused row only.
 * A resting chip was drawn at 232 px first and rejected. On a half-width pair
 * it is 19 % of the field, on roughly thirty rows, permanently.
 *
 * ONE `<input>`, NEVER SWAPPED. The number and the formula are the same DOM
 * node, so focus and caret survive typing a `=`. That is also why the spinner
 * is drawn here instead of delegated to `NumberInput`, whose `type="number"`
 * cannot hold `= life_current / 8`: the spinner and the arrow keys are a
 * PREDICATE over the current text, not a mode the field remembers.
 *
 * PROMOTION FLOATS, IT NEVER REFLOWS (§58). A formula being edited in a
 * half-width field (`w`/`h`, `x`/`y`, the two gap cells) takes the whole row
 * as an OVERLAY above its neighbours, with its own box frozen at the height it
 * had, so nothing beside it moves. §36 did this by giving the field
 * `flex: 1 0 100%`, which dropped the sibling onto a new line and pushed every
 * row under it down: a layout shift caused by touching a control, which is the
 * fault this pass exists to remove. `behavior/promote-overlay.ts` holds the one
 * measurement it needs; a permanently taller field taxes every pair for a case
 * most nodes never have, a scrolling field cannot be read without dragging, and
 * a popover is absurd for `= item`.
 */
import './ValueInput.css';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { Icon } from '@ds/primitives/Icon';
import { TextInput } from '@ds/primitives/TextInput';
import { resolveValue } from '@shared/hud/data';
import { readExpr } from '../../behavior/check-expr';
import { useInstanceScopes } from '../../behavior/formula-scope';
import { usePromoteOverlay } from './behavior/promote-overlay';
import { useValueInput } from './behavior/use-value-input';
import { FormulaFeedback } from './sub-components/FormulaFeedback';
import { FormulaMenu } from './sub-components/FormulaMenu';
import { FormulaProblem } from './sub-components/FormulaProblem';
import type { ValueInputProps } from './ValueInput.type';

const CHEVRON_UP = 'M3.5 9.75 8 5.25l4.5 4.5';
const CHEVRON_DOWN = 'M3.5 6.25 8 10.75l4.5-4.5';

const NOT_A_NUMBER = 'This takes a number or a formula. Start with = to write one.';

const rangeNote = (n: number, min?: number, max?: number): string | undefined => {
  if (min !== undefined && n < min) return `Valid, but below this field's ${min}.`;
  if (max !== undefined && n > max) return `Valid, but above this field's ${max}.`;
  return undefined;
};

const ValueInput = (props: ValueInputProps) => {
  const {
    label, value, onChange, onClear, scope, insideRepeat = false, extraNames, role = 'number',
    min, max, step = 1, placeholder, hint, readOnly = false, derivedFrom,
    className = '', 'aria-label': ariaLabel,
  } = props;

  const field = useValueInput({ value, onChange, onClear, step, min, max });
  // THE SPINNER IS NAMED AFTER THE FIELD, and a field whose visible label is a
  // glyph in the caller's own row carries its name on `aria-label` instead
  // (§56's gap cells, `MinMaxField`'s limits). Reading only `label` left both
  // of those with a button called "Increment value".
  const named = ariaLabel ?? label ?? 'value';
  const instances = useInstanceScopes();
  const anchorRef = field.inputRef;
  const promote = usePromoteOverlay(field.focused, field.formula, field.inputRef);

  const reading = field.expr === null ? null : readExpr(field.expr, { insideRepeat, extraNames });
  const literalProblem = !field.formula && field.text.trim() !== '' && !field.canStep
    ? NOT_A_NUMBER : undefined;
  const problem = reading?.problem ?? null;

  // THE RESULT IS OF WHAT IS TYPED, the moment it compiles. Withholding it for
  // the whole of a focused edit meant a finished `= 4 + 4` still read "not
  // finished" until the field was left, which is the one moment nobody is looking at it.
  // A half-typed `life_current /` does not compile, so it is withheld by
  // `problem`, which is the honest test; "is the caret still here" never was.
  const result = field.expr === null || problem !== null
    ? null : resolveValue({ from: 'data', expr: field.expr }, scope);

  return (
    <Field
      size="sm"
      label={label}
      hint={hint ?? (readOnly ? derivedFrom : undefined)}
      error={problem?.message ?? literalProblem}
      className={`hud-value-field ${className}${promote.className}`}
      style={promote.style}
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
            <Button variant="bare" tabIndex={-1} aria-label={`Increment ${named}`} onClick={() => field.stepBy(1)}>
              <Icon size={12} paths={[CHEVRON_UP]} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </Button>
            <Button variant="bare" tabIndex={-1} aria-label={`Decrement ${named}`} onClick={() => field.stepBy(-1)}>
              <Icon size={12} paths={[CHEVRON_DOWN]} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
            </Button>
          </Box>
        )}

        {field.focused && !field.formula && !readOnly && (
          <Button
            variant="bare"
            className="hud-value-input__chip"
            title="Drive this from the game, or type ="
            aria-label="Write a formula"
            onMouseDown={(event) => event.preventDefault()}
            onClick={field.startFormula}
          >=</Button>
        )}

        {field.formula && !readOnly && (
          <Button
            variant="bare"
            className="hud-value-input__fx"
            aria-label="Insert a name or a formula"
            onMouseDown={(event) => event.preventDefault()}
            onClick={field.openMenu}
          >ƒ ▾</Button>
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
