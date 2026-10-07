/* @layer renderer-components @kind component */
/**
 * Everything under a formula, in the order it is wanted: the RESULT, the strip
 * when there is one, the names it reads with their live values, and a warning
 * when the number is legal but nobody meant it.
 *
 * THE RESULT IS WITHHELD MID-EDIT, never guessed. A half-typed
 * `life_current /` that showed `→ 0` would be a lie on every keystroke, and the
 * one thing this line exists to be is trustworthy.
 *
 * AMBER IS NOT RED. State 7 is a formula that parses, names only known
 * variables, raises nothing at any layer today, and still answers a number
 * nobody meant. `ceil(life_max / 0)` folds `Infinity` to the safety ceiling in
 * `resolve-value.ts` and hands back 1,000,000 as if it were a measurement.
 * Nothing is broken, so nothing is coloured as though it were.
 */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { MAX_SAFE_RESULT } from '@shared/hud/data';
import { InstanceStrip } from './InstanceStrip';
import type { Scope } from '../../../behavior/formula-scope';

interface FormulaFeedbackProps {
  expr: string;
  reads: readonly string[];
  scope: Scope;
  instances: readonly Scope[];
  /** Null while the formula is mid-edit or does not compile. */
  result: number | null;
  /** Outside the field's own accepted range. Valid, and still surprising. */
  outOfRange?: string;
}

const CEILING = 'That is the safety ceiling, not your number. Something here divides by zero.';

const format = (n: number): string => String(Math.round(n * 1000) / 1000);

const FormulaFeedback = (props: FormulaFeedbackProps) => {
  const { expr, reads, scope, instances, result, outOfRange } = props;
  const atCeiling = result !== null && Math.abs(result) === MAX_SAFE_RESULT;
  const warning = atCeiling ? CEILING : outOfRange;

  return (
    <Box className="hud-value-input__feedback">
      <Text className="hud-value-input__result">
        {result === null ? '... not finished' : `→ ${format(result)}`}
      </Text>
      {instances.length > 0 && <InstanceStrip expr={expr} instances={instances} />}
      {reads.length > 0 && (
        <Box className="hud-value-input__reads">
          {reads.map((name) => (
            <Text key={name} className="hud-value-input__read">
              {name}
              {' '}
              <Text as="b">{name in scope ? format(scope[name]) : '-'}</Text>
            </Text>
          ))}
        </Box>
      )}
      {warning !== undefined && <Text className="hud-inspect__warning">{warning}</Text>}
    </Box>
  );
};

export { FormulaFeedback };
export type { FormulaFeedbackProps };
