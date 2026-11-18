/* @layer renderer-components @kind component */
import { Pressable, Text } from '@drizztdourden08/tessera/primitives';
import type { FormulaProblemProps } from './FormulaProblem.type';
import { useT, useText } from '@drizztdourden08/brock-react';

const FormulaProblem = (props: FormulaProblemProps) => {
  const t = useT();
  const text = useText();
  const { problem, onFix } = props;
  if (!problem) return null;

  return (
    <>
      {problem.fix && (
        <Pressable className="hud-value-input__fix" onClick={() => onFix(problem.fix?.expr ?? '')}>
          {text(problem.fix.label)} ↵
        </Pressable>
      )}
      {problem.suggestion !== undefined && <Text className="hud-inspect__warning">{text(problem.suggestion)}</Text>}
      {problem.column !== undefined && <Text className="hud-value-input__column">{t('hud-editor:formula-problem.column', { column: problem.column })}</Text>}
    </>
  );
};

export { FormulaProblem };
