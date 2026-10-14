/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { useControllerOverlay } from '../behavior/useControllerOverlay';
import { useControllerPause } from '../behavior/useControllerPause';
import { MANUAL_PAUSE_NAME } from '../GameLayer.constants';
import { ControllerDisconnectOverlay } from './ControllerDisconnectOverlay';
import type { PauseLayerProps } from './PauseLayer.type';

const PauseLayer = (props: PauseLayerProps) => {
  const { status } = props;
  const { controllerPaused, disconnectedName } = useControllerPause(status);
  const overlay = useControllerOverlay(controllerPaused);
  if (!controllerPaused || status !== 'running') return null;

  const isManualPause = !disconnectedName || disconnectedName === MANUAL_PAUSE_NAME;
  if (!isManualPause) {
    return (
      <ControllerDisconnectOverlay
        controllerName={disconnectedName}
        pauseMapping={overlay.pauseMapping}
        prevMapping={overlay.prevMapping}
        nextMapping={overlay.nextMapping}
        canSwitchProfile={overlay.canSwitchProfile}
        onResume={overlay.onResume}
      />
    );
  }

  return (
    <Box className="game-layer__pause-overlay">
      <Box className="game-layer__pause-icon">
        <Box className="game-layer__pause-bar" />
        <Box className="game-layer__pause-bar" />
      </Box>
    </Box>
  );
};

export { PauseLayer };
