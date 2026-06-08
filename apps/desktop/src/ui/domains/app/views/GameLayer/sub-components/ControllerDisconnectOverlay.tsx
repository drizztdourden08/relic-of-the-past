/* @layer renderer-components @kind component */
/**
 * ControllerDisconnectOverlay — shown when the active controller disconnects
 * during gameplay. Blocks input and shows resume instructions.
 */

import { Box } from '../../../../../design-system/primitives/Box';
import { Text } from '../../../../../design-system/primitives/Text';
import './ControllerDisconnectOverlay.css';

interface ControllerDisconnectOverlayProps {
  controllerName: string;
}

const ControllerDisconnectOverlay = (props: ControllerDisconnectOverlayProps) => {
  const { controllerName } = props;
  return (
    <Box className="controller-disconnect-overlay">
      <Box className="controller-disconnect-overlay__card">
        <Box className="controller-disconnect-overlay__icon">🎮</Box>
        <Text as="h2" className="controller-disconnect-overlay__title">Controller Disconnected</Text>
        <Text as="p" className="controller-disconnect-overlay__message">
          <Text as="strong">{controllerName}</Text> has been disconnected.
        </Text>
        <Box className="controller-disconnect-overlay__actions">
          <Text as="p">Reconnect the controller, or:</Text>
          <Box as="ul">
            <Text as="li">Double-click the game canvas to resume</Text>
            <Text as="li">Press <Text as="kbd">F10</Text> to resume</Text>
            <Text as="li">Use another registered controller</Text>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export { ControllerDisconnectOverlay };
