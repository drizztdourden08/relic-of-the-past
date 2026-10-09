/* @layer renderer-hud @kind component */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
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
