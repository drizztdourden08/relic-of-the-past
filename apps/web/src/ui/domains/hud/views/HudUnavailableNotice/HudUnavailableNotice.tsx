/* @layer renderer-hud @kind component */
/**
 * Replaces the main HUD overlay when it cannot draw its sprites, which has
 * exactly one cause: no extracted sprites for the active ROM. (It used to have
 * a second, the Modern style having no renderer; Modern draws the same HUD as
 * Enhanced, so that reason is gone.) Plain HTML, informational only.
 */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import './HudUnavailableNotice.css';

const HEADLINE = 'HUD sprites are not extracted for this ROM.';
const CAPTION = 'Switch HUD Mode to Original, or extract sprites in the Data Manager.';

const HudUnavailableNotice = () => (
  <Box className="hud-unavailable">
    <Box className="hud-unavailable__box">
      <Text variant="label">{HEADLINE}</Text>
      <Text variant="caption">{CAPTION}</Text>
    </Box>
  </Box>
);

export { HudUnavailableNotice };
