/* @layer renderer-hud @kind component */
/**
 * HudUnavailableNotice — replaces the enhanced main HUD when it can't render its
 * sprites: the Modern style (still WIP) or the Vanilla style without extracted
 * sprites for the active ROM. Plain HTML (no sprites), purely informational.
 */
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import './HudUnavailableNotice.css';

interface HudUnavailableNoticeProps {
  reason: 'modern' | 'no-sprites';
}

const MESSAGES: Record<HudUnavailableNoticeProps['reason'], string> = {
  modern: 'Modern HUD is not available yet.',
  'no-sprites': 'HUD sprites are not extracted for this ROM.',
};

const HudUnavailableNotice = ({ reason }: HudUnavailableNoticeProps) => (
  <Box className="hud-unavailable">
    <Box className="hud-unavailable__box">
      <Text variant="label">{MESSAGES[reason]}</Text>
      <Text variant="caption">Switch HUD Mode to Original, or extract sprites in the Data Manager.</Text>
    </Box>
  </Box>
);

export { HudUnavailableNotice };
export type { HudUnavailableNoticeProps };
