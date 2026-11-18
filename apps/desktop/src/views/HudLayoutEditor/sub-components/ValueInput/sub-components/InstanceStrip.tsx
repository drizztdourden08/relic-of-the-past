/* @layer renderer-components @kind component */
import './InstanceStrip.css';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { resolveValue } from '@rotp/hud';
import { summarise } from '../behavior/summarise';
import { MAX_CELLS } from './InstanceStrip.constants';
import type { InstanceStripProps } from './InstanceStrip.type';
import { useT } from '@drizztdourden08/brock-react';

const InstanceStrip = (props: InstanceStripProps) => {
  const t = useT();
  const { expr, instances, previewIndex = 0 } = props;
  if (instances.length === 0) return null;

  const shown = instances.slice(0, MAX_CELLS);
  const values = shown.map((scope) => resolveValue({ from: 'data', expr }, scope));
  const over = instances.length - shown.length;

  return (
    <Box className="hud-instance-strip">
      <Box className="hud-instance-strip__cells" aria-label={t('hud-editor:instance-strip.result', { count: instances.length })}>
        {values.map((value, index) => (
          <Text
            key={index}
            className={`hud-instance-strip__cell${index === previewIndex ? ' is-preview' : ''}`}
            data-on={value > 0 ? 'true' : undefined}
            title={`#${index + 1} -> ${value}`}
          />
        ))}
      </Box>
      <Text className="hud-instance-strip__read">
        {summarise(values, t)}{over > 0 ? ` · ${t('hud-editor:instance-strip.first', { shown: MAX_CELLS, total: instances.length })}` : ''}
      </Text>
    </Box>
  );
};

export { InstanceStrip };
