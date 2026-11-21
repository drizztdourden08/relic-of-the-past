/* @layer renderer-app @kind component */
import type { CSSProperties } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { TouchZoneProps } from './TouchZone.type';
import './TouchZone.css';

const TouchZone = (props: TouchZoneProps) => {
  const { rect, strength, selected = false } = props;
  const t = useT();
  const style = { ...rect, '--touch-strength': strength } as CSSProperties;

  return (
    <Box className="touch-zone" style={style} data-selected={selected || undefined}>
      <Text className="touch-zone__label">{t('compounds:touch-zone.stick-area')}</Text>
    </Box>
  );
};

export { TouchZone };
