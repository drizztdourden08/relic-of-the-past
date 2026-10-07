/* @layer renderer-components @kind component */
/**
 * SchemeBanner is one line and one button, shown on the Controls screen while the
 * profile is on the Classic scheme.
 *
 * THERE IS NO SCHEME CONTROL ANY MORE. The scheme is not a choice of its own: it
 * follows the HUD style, and the Modern style is what turns it on. A segmented
 * control here would have been a second switch for one fact, and the player who
 * pressed it would have been changing the HUD without being told. So this says
 * where the switch actually is and takes them there, using the same deep link the
 * Cheats lock uses (`SETTINGS_TARGETS.hudStyle`).
 *
 * Under Modern there is nothing to say, so nothing is drawn: a permanent line
 * explaining a setting that is already how you want it is just noise.
 */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import { Button } from '../../../../../../design-system/primitives/Button';
import './SchemeBanner.css';

const BANNER_TEXT = 'Modern controls are part of the Modern HUD style.';
const BANNER_ACTION = 'Enable in HUD settings';

interface SchemeBannerProps {
  /** Deep-links to the HUD tab's Style row, which is the one place the scheme is decided. */
  onOpenHudStyle: () => void;
}

const SchemeBanner = ({ onOpenHudStyle }: SchemeBannerProps) => (
  <Box className="scheme-banner">
    <Text variant="caption">{BANNER_TEXT}</Text>
    <Button variant="tertiary" size="sm" onClick={onOpenHudStyle}>{BANNER_ACTION}</Button>
  </Box>
);

export { SchemeBanner };
export type { SchemeBannerProps };
