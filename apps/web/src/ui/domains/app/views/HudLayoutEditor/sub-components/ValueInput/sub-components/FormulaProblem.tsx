/* @layer renderer-components @kind component */
import { Button, Text } from '@drizztdourden08/tessera/primitives';
import type { FormulaProblemProps } from './FormulaProblem.type';

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
export type { FormulaProblemProps } from './FormulaProblem.type';
