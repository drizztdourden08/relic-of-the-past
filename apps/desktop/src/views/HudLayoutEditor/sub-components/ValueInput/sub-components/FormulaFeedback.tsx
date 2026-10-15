/* @layer renderer-components @kind component */
import { Box, Icon, Text } from '@drizztdourden08/tessera/primitives';
import { MAX_SAFE_RESULT } from '@rotp/hud';
import { InstanceStrip } from './InstanceStrip';
import { CEILING } from './FormulaFeedback.constants';
import type { FormulaFeedbackProps } from './FormulaFeedback.type';

const format = (n: number): string => String(Math.round(n * 1000) / 1000);

const readValue = (scope: FormulaFeedbackProps['scope'], name: string): string => {
  const value = name in scope ? scope[name] : undefined;
  return value === undefined ? '-' : format(value);
};

const FormulaFeedback = (props: FormulaFeedbackProps) => {
  const { expr, reads, scope, instances, result, outOfRange } = props;
  const atCeiling = result !== null && Math.abs(result) === MAX_SAFE_RESULT;
  const warning = atCeiling ? CEILING : outOfRange;

  return (
    <Box className="hud-value-input__feedback">
      <Text className="hud-value-input__result">
        {result === null
          ? '... not finished'
          : <><Icon name="arrow-right" size={12} aria-hidden /> {format(result)}</>}
      </Text>
      {instances.length > 0 && <InstanceStrip expr={expr} instances={instances} />}
      {reads.length > 0 && (
        <Box className="hud-value-input__reads">
          {reads.map((name) => (
            <Text key={name} className="hud-value-input__read">
              {name}
              {' '}
              <Text as="b">{readValue(scope, name)}</Text>
            </Text>
          ))}
        </Box>
      )}
      {warning !== undefined && <Text className="hud-inspect__warning">{warning}</Text>}
    </Box>
  );
};

export { FormulaFeedback };
