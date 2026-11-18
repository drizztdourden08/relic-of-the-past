/* @layer renderer-components @kind component */
import { useInstanceScopes } from '@app/hud-layout-editing/formula-scope';
import { rangeNote } from '../behavior/range-note';
import { FormulaFeedback } from './FormulaFeedback';
import { FormulaProblem } from './FormulaProblem';
import type { ValueInputFeedbackProps } from './ValueInputFeedback.type';
import { useT } from '@drizztdourden08/brock-react';

const ValueInputFeedback = (props: ValueInputFeedbackProps) => {
  const t = useT();
  const { formula, expr, reading, scope, insideRepeat, min, max, onChange } = props;
  const { reading: read, problem, result } = reading;
  const instances = useInstanceScopes();

  return (
    <>
      {formula && problem === null && (
        <FormulaFeedback
          expr={expr ?? ''}
          reads={read?.reads ?? []}
          scope={scope}
          instances={insideRepeat ? instances : []}
          result={result}
          outOfRange={result === null ? undefined : rangeNote(result, min, max, t)}
        />
      )}
      <FormulaProblem problem={problem} onFix={(fixed) => onChange({ from: 'data', expr: fixed })} />
    </>
  );
};

export { ValueInputFeedback };
