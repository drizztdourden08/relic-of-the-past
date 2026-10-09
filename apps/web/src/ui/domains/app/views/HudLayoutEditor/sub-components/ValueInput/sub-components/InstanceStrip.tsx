/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { resolveValue } from '@shared/hud/data';
import { summarise } from '../behavior/summarise';
import { MAX_CELLS } from './InstanceStrip.constants';
import type { InstanceStripProps } from './InstanceStrip.type';

const InstanceStrip = (props: InstanceStripProps) => {
  const { expr, instances, previewIndex = 0 } = props;
  if (instances.length === 0) return null;

  const shown = instances.slice(0, MAX_CELLS);
  const values = shown.map((scope) => resolveValue({ from: 'data', expr }, scope));
  const over = instances.length - shown.length;

  return (
    <Box className="hud-instance-strip">
      <Box className="hud-instance-strip__cells" aria-label={`Result across ${instances.length} instances`}>
        {values.map((value, index) => (
          <Text
            key={index}
            className={`hud-instance-strip__cell${index === previewIndex ? ' is-preview' : ''}`}
            data-on={value > 0 ? 'true' : undefined}
            title={`#${index + 1} → ${value}`}
          />
        ))}
      </Box>
      <Text className="hud-instance-strip__read">
        {summarise(values)}{over > 0 ? ` · first ${MAX_CELLS} of ${instances.length}` : ''}
      </Text>
    </Box>
  );
};

export { InstanceStrip };
export type { InstanceStripProps } from './InstanceStrip.type';
