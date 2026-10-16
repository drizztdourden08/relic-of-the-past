/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { SectionHeadProps } from '../home-tab.type';

const SectionHead = ({ title, action }: SectionHeadProps) => (
  <Box className="home-tab__section-header">
    <Text as="h3" className="home-tab__section-title">{title}</Text>
    {action}
  </Box>
);

export { SectionHead };
