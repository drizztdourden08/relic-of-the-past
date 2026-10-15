/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
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
