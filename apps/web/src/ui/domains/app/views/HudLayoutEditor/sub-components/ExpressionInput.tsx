/* @layer renderer-components @kind component */
/**
 * A bare expression STRING, wherever the document stores one instead of a
 * `Value`: a switch case's `when`, a repeat's `item`, an animation or
 * transition gate.
 *
 * IT IS THE SAME FIELD, adapted at the type boundary only. The document holds
 * `string`, `ValueInput` speaks `Value`, and the leading `=` never crosses
 * either. It is a thing a person types, not a thing anything stores. So the
 * adapter is two conversions and nothing else, and the ~5 call sites that pass
 * `value`/`onChange`/`scope`/`insideRepeat`/`extraNames`/`aria-label` do not
 * change.
 *
 * `role="gate"` IS THE ONE THING IT ADDS. These fields are conditions, so the
 * starting points they are offered are comparisons and `and`, never "a
 * fraction of a maximum". A flat palette of every function cannot produce that
 * contextual list, which is why the starters beat one.
 *
 * WHAT WENT: the `+ var` `Select`, whose insertion appended
 * `value.trim() + ' ' + name` and so was correct only when the caret happened
 * to be at the end, and the `? syntax` link, which opened expr-eval's own
 * README. That document describes array literals, the `in` operator and
 * `||`-as-or, all three of which this grammar refuses. `FormulaMenu` is the
 * in-panel replacement and it is generated from the same probe as the parser.
 */
import { ValueInput } from './ValueInput';

interface ExpressionInputProps {
  value: string;
  onChange: (next: string) => void;
  /** The live scope to preview against. It is the sample state's own data scope. */
  scope: Readonly<Record<string, number>>;
  /** Whether `index`/`count`/`item` are valid names here. */
  insideRepeat?: boolean;
  /** A name valid only at this one call site (`transition.when`'s `delta`). */
  extraNames?: readonly string[];
  placeholder?: string;
  'aria-label'?: string;
}

const ExpressionInput = (props: ExpressionInputProps) => {
  const { value, onChange, ...rest } = props;
  return (
    <ValueInput
      {...rest}
      role="gate"
      value={{ from: 'data', expr: value }}
      onChange={(next) => onChange(typeof next === 'number' ? String(next) : next.expr)}
    />
  );
};

export { ExpressionInput };
export type { ExpressionInputProps };
