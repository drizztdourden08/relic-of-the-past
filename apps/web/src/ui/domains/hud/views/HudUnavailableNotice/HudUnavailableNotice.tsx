/* @layer renderer-hud @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { CAPTION, HEADLINE } from './HudUnavailableNotice.constants';
import './HudUnavailableNotice.css';

const HudUnavailableNotice = () => (
  <Box className="hud-unavailable">
    <Box className="hud-unavailable__box">
      <Text variant="label">{HEADLINE}</Text>
      <Text variant="caption">{CAPTION}</Text>
    </Box>
  </Box>
);

export { HudUnavailableNotice };
