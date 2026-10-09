/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
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
