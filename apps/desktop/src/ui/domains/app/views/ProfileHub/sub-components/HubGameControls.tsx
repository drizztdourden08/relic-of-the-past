/* @layer renderer-components @kind component */
import { useCallback, useEffect, useState } from 'react';
import { Box, Button, Icon, Spinner } from '@drizztdourden08/tessera/primitives';
import { useGamePause } from '../behavior/useGamePause';
import type { HubGameControlsProps } from './HubGameControls.type';
import './HubGameControls.css';

const HubGameControls = (props: HubGameControlsProps) => {
  const { isGameRunning, showPlay, size = 'sm', onStartGame, onStopGame, onResetGame } = props;
  const { gamePaused, handleTogglePause } = useGamePause(isGameRunning);
  const [stopping, setStopping] = useState(false);
  useEffect(() => { if (!isGameRunning) setStopping(false); }, [isGameRunning]);
  const handleStop = useCallback(() => { setStopping(true); onStopGame(); }, [onStopGame]);

  if (!isGameRunning) {
    return showPlay ? <Button variant="primary" size={size} icon={<Icon name="play" />} onClick={onStartGame}>Play</Button> : null;
  }
  return (
    <Box className="hub-game-controls">
      <Button variant="tertiary" size={size} icon={<Icon name={gamePaused ? 'play' : 'pause'} />} onClick={handleTogglePause} disabled={stopping}>
        {gamePaused ? 'Resume' : 'Pause'}
      </Button>
      <Button variant="danger" size={size} icon={stopping ? <Spinner size="sm" /> : <Icon name="square" />} onClick={handleStop} disabled={stopping}>
        {stopping ? 'Stopping...' : 'Stop'}
      </Button>
      <Button variant="tertiary" size={size} icon={<Icon name="rotate-ccw" />} onClick={onResetGame} disabled={stopping}>Reset</Button>
    </Box>
  );
};

export { HubGameControls };
export type { HubGameControlsProps };
