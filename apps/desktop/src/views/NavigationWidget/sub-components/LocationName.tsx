/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { LocationNameProps } from './LocationSection.type';

const LocationName = ({ screenBundle, screenName, isIndoors }: LocationNameProps) => (
  <Box className="nav-loc-name">
    {screenBundle ? screenBundle.name : screenName}
    {screenBundle?.isMulti && <Text className="nav-multi-count">({screenBundle.screens.length} {isIndoors ? 'rooms' : 'screens'})</Text>}
  </Box>
);

export { LocationName };
