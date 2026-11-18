/* @layer renderer-widgets @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import type { LocationNameProps } from './LocationSection.type';

const LocationName = ({ screenBundle, screenName, isIndoors }: LocationNameProps) => {
  const t = useT();
  return (
    <Box className="nav-loc-name">
      {screenBundle ? screenBundle.name : screenName}
      {screenBundle?.isMulti && <Text className="nav-multi-count">{t(isIndoors ? 'views-navigation:location.rooms' : 'views-navigation:location.screens', { count: screenBundle.screens.length })}</Text>}
    </Box>
  );
};

export { LocationName };
