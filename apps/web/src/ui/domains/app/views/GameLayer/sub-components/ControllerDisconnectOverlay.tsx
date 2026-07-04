/* @layer renderer-components @kind component */
/**
 * ControllerDisconnectOverlay — shown when a device the active profile maps
 * disconnects (or is missing at startup). Blocks input and shows how to recover,
 * with the actual bound shortcuts rendered as icons. Double-click resumes.
 */

import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import { InputGlyph } from '../../../compounds/InputGlyph';
import { resolveFunctionMappingIcon } from '../../../../../../lib/game';
import type { FunctionMapping } from '@shared/types/controls';
import './ControllerDisconnectOverlay.css';

interface ControllerDisconnectOverlayProps {
  controllerName: string;
  pauseMapping: FunctionMapping | null;
  prevMapping: FunctionMapping | null;
  nextMapping: FunctionMapping | null;
  canSwitchProfile: boolean;
  onResume: () => void;
}

const glyph = (m: FunctionMapping) => (
  <InputGlyph binding={m.binding} icon={m.icon ?? resolveFunctionMappingIcon(m)} showLabel={false} />
);

const ControllerDisconnectOverlay = (props: ControllerDisconnectOverlayProps) => {
  const { controllerName, pauseMapping, prevMapping, nextMapping, canSwitchProfile, onResume } = props;
  const showResume = pauseMapping != null && pauseMapping.binding.type !== 'none';
  const showSwitch = canSwitchProfile && prevMapping != null && nextMapping != null;

  return (
    <Box className="controller-disconnect-overlay" onDoubleClick={onResume}>
      <Box className="controller-disconnect-overlay__card">
        <Box className="controller-disconnect-overlay__icon">🎮</Box>
        <Text as="h2" className="controller-disconnect-overlay__title">Controller Disconnected</Text>
        <Text as="p" className="controller-disconnect-overlay__message">
          <Text as="strong">{controllerName}</Text> is not connected.
        </Text>
        <Box className="controller-disconnect-overlay__actions">
          <Text as="p">Reconnect it to continue, or:</Text>
          <Box className="controller-disconnect-overlay__option">
            <Text>Double-click here to resume</Text>
          </Box>
          {showResume && (
            <Box className="controller-disconnect-overlay__option">
              {glyph(pauseMapping)}
              <Text>Resume</Text>
            </Box>
          )}
          {showSwitch && (
            <Box className="controller-disconnect-overlay__option">
              {glyph(prevMapping)}{glyph(nextMapping)}
              <Text>Switch input profile</Text>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export { ControllerDisconnectOverlay };
