/* @layer renderer-components @kind component */
/**
 * The three lines that follow a translated expression error: the one-click
 * whole-expression replacement, the did-you-mean, and the column.
 *
 * EXTRACTED IN PHASE 9 BECAUSE THERE IS A SECOND FIELD NOW. `TextValueField`
 * takes a formula in exactly the same way `ValueInput` does and has to report
 * one in exactly the same way. The plan's requirement is that EVERY
 * expression in the Content section speaks §36's sentences, not most of them.
 * Two copies of these three lines is how the two would eventually stop
 * agreeing.
 *
 * A FIX IS A WHOLE REPLACEMENT EXPRESSION, never a patch (§36.3), so applying
 * one cannot half-correct a formula.
 */
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import type { ExprProblem } from '../../../behavior/expr-errors';

interface FormulaProblemProps {
  /** Null when the formula parses and names only known variables. */
  problem: ExprProblem | null;
  /** Applies `fix.expr` as the whole expression. */
  onFix: (expr: string) => void;
}

const FormulaProblem = (props: FormulaProblemProps) => {
  const { problem, onFix } = props;
  if (!problem) return null;

  return (
    <>
      {problem.fix && (
        <Button variant="bare" className="hud-value-input__fix" onClick={() => onFix(problem.fix?.expr ?? '')}>
          {problem.fix.label} ↵
        </Button>
      )}
      {problem.suggestion !== undefined && <Text className="hud-inspect__warning">{problem.suggestion}</Text>}
      {problem.column !== undefined && <Text className="hud-value-input__column">column {problem.column}</Text>}
    </>
  );
};

export { FormulaProblem };
export type { FormulaProblemProps };
