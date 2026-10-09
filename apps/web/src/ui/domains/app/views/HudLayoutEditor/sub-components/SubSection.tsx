/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import './HudLayoutEditor.layout.css';
import './HudLayoutEditor.layout-set.css';
import type { SubSectionProps } from './SubSection.type';

const SubSection = (props: SubSectionProps) => {
  const { title, children } = props;
  return (
    <Box className="hud-subsec" role="group" aria-label={title}>
      <Text className="hud-subsec__title">{title}</Text>
      <Box className="hud-subsec__body">{children}</Box>
    </Box>
  );
};

export { SubSection };
export type { SubSectionProps } from './SubSection.type';
