/* @layer renderer-components @kind component */
/**
 * A `text` element's value, as ONE field. It also deletes a real
 * data-loss bug.
 *
 * WHAT WAS THERE. Two mode switches for one property, stacked: an OUTER
 * `text | ƒx` `SegmentedControl` choosing between a `TextInput` and a
 * `ValueField`, and `ValueField`'s own inner `123 | ƒx` (already deleted in
 * phase 4). The outer one wrote `{ from: 'data', expr: '0' }` going one way
 * and `''` going the other, so a round trip through it DESTROYED whatever
 * formula was in the field, while the inner control it wrapped went to real
 * trouble to preserve exactly that. Nothing warned, nothing undid it, and the
 * expression was gone.
 *
 * WHAT IT IS. The same input `ValueInput` is, minus the assumption that a
 * literal has to be a number: a leading `=` says formula and is never stored,
 * `==` escapes one literal `=`, and everything else is the string it looks
 * like (`behavior/value-text.ts`). There is no mode, so there is nothing a
 * mode can discard.
 *
 * NOT `ValueInput` ITSELF, and the reason is a type, not a preference.
 * `ValueInput` speaks `Value` and reports "this takes a number or a formula"
 * for anything else, which is correct for the thirty numeric rows it serves
 * and wrong for the one property in the document typed `Value | string`.
 * Everything the two must AGREE about is shared: `value-text.ts`'s rule,
 * `readExpr`'s translated errors, `FormulaFeedback`'s result line and
 * `FormulaProblem`'s three follow-up lines.
 */
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Field } from '@ds/primitives/Field';
import { TextInput } from '@ds/primitives/TextInput';
import { resolveValue } from '@shared/hud/data';
import { readExpr } from '../../behavior/check-expr';
import { useInstanceScopes } from '../../behavior/formula-scope';
import { useTextValue } from '../../behavior/use-text-value';
import { FormulaFeedback, FormulaProblem, usePromoteOverlay } from '../ValueInput';
import type { Value } from '@shared/types/hud';

interface TextValueFieldProps {
  value: Value | string;
  onChange: (next: Value | string) => void;
  scope: Readonly<Record<string, number>>;
  insideRepeat?: boolean;
}

const TextValueField = (props: TextValueFieldProps) => {
  const { value, onChange, scope, insideRepeat = false } = props;
  const field = useTextValue({ value, onChange });
  const instances = useInstanceScopes();
  const promote = usePromoteOverlay(field.focused, field.formula, field.inputRef);

  const reading = field.expr === null ? null : readExpr(field.expr, { insideRepeat });
  const problem = reading?.problem ?? null;
  // Shown the moment it compiles. See `ValueInput.tsx`.
  const result = field.expr === null || problem !== null
    ? null : resolveValue({ from: 'data', expr: field.expr }, scope);

  return (
    <Field
      size="sm"
      label="value"
      error={problem?.message}
      className={`hud-value-field${promote.className}`}
      style={promote.style}
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
          <Button
            variant="bare"
            className="hud-value-input__chip"
            title="Drive this from the game, or type ="
            aria-label="Write a formula"
            onMouseDown={(event) => event.preventDefault()}
            onClick={field.startFormula}
          >=</Button>
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
export type { TextValueFieldProps };
