/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { LayoutSettingsPieceProps } from './LayoutSettings.type';

const LayoutSettingsPiece = (props: LayoutSettingsPieceProps) => {
  const { label, grow, children } = props;
  return (
    <Box className={`hud-layout-set__piece${grow ? ' hud-layout-set__piece--grow' : ''}`}>
      <Text className="hud-layout-set__label">{label}</Text>
      {children}
    </Box>
  );
};

export { LayoutSettingsPiece };
