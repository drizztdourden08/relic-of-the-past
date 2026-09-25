/* @layer renderer-components @kind component */
/**
 * SECTION TWO IS FLOW, AND IT IS ITS OWN SECTION FOR ONE REASON (§58).
 *
 * §56 put `direction` and `wrap` on a line ABOVE the alignment tiles, inside the
 * same section. That is exactly the shape the maintainer refused:
 *
 * > "NOTHING IN A FUCKING SECTION SHOULD CHANGE WHEN CLICKING ANY FUCKING OTHER
 * > OPTION IN THAT SAME FUCKING SECTION!"
 *
 * That broke the rule because a flex container's alignment tiles TURN with
 * `direction` (§56.3's diagrams turn with it, "the one thing two text dropdowns could
 * never show"). Pressing `column` rotated six tiles sitting two rows below it in
 * the same section.
 *
 * THE TILES TURNING IS RIGHT AND STAYS. What was wrong is where the switch was.
 * Flow is its own concern (which way the children run, and whether they start a
 * new line), so it gets its own title and its own gold rule, and the alignment
 * it reshapes is a LATER section reacting to an EARLIER one. That the rule
 * allows; a section rearranging itself it does not.
 *
 * TWO OPTIONS, BOTH ICONS, ONE ROW. `direction` is two arrows and `wrap` is one
 * toggle. That is ~86px all told, which fits every rail the inspector can be dragged
 * to, so this section is one line at 220 and at 320 alike.
 */
import wrapIcon from '@iconify-icons/lucide/wrap-text';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Box } from '@ds/primitives/Box';
import { IconButton } from '@ds/primitives/IconButton';
import { Text } from '@ds/primitives/Text';
import { DirectionControl } from './DirectionControl';
import { SubSection } from './SubSection';
import './HudLayoutEditor.layout.css';
import type { FlowDirection } from '../behavior/align-options';

const WRAP_LABEL = 'wrap. Children that do not fit start a new line along the cross axis';

interface FlowSettingsProps {
  direction: FlowDirection;
  onDirection: (next: FlowDirection) => void;
  wrap: boolean;
  onWrap: (next: boolean) => void;
}

const FlowSettings = (props: FlowSettingsProps) => {
  const { direction, onDirection, wrap, onWrap } = props;
  return (
    <SubSection title="Flow">
      <Box className="hud-engine-row">
        <Box className="hud-layout-set__piece">
          <Text className="hud-layout-set__label">Direction</Text>
          <DirectionControl variant="bare" value={direction} onChange={onDirection} />
        </Box>
        <Box className="hud-layout-set__piece">
          <Text className="hud-layout-set__label">Wrap</Text>
          <IconButton
            variant="ghost"
            size="sm"
            title={WRAP_LABEL}
            active={wrap}
            label={WRAP_LABEL}
            data-action="wrap"
            onClick={() => onWrap(!wrap)}
          >
            <IconifyIcon icon={wrapIcon} width={16} height={16} aria-hidden />
          </IconButton>
        </Box>
      </Box>
    </SubSection>
  );
};

export { FlowSettings, WRAP_LABEL };
export type { FlowSettingsProps };
