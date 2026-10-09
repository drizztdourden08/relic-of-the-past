/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { MAX_SAFE_RESULT } from '@shared/hud/data';
import { InstanceStrip } from './InstanceStrip';
import { CEILING } from './FormulaFeedback.constants';
import type { FormulaFeedbackProps } from './FormulaFeedback.type';

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
export type { FormulaFeedbackProps } from './FormulaFeedback.type';
