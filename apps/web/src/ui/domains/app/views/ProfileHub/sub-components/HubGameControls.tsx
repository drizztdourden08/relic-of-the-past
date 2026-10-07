/* @layer renderer-components @kind component */
/**
 * The game controls: Play when stopped, else Pause, Stop and Reset. On the home
 * tab they sit in the hero under the mode; on every other tab, in the window's
 * title bar. Stop is slow (save-on-quit, then teardown), so it shows progress
 * and ignores repeat clicks until the game has stopped.
 */
import { useCallback, useEffect, useState } from 'react';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import { Spinner } from '../../../../../design-system/primitives/Spinner';
import { useGamePause } from '../behavior/useGamePause';

interface HubGameControlsProps {
  isGameRunning: boolean;
  showPlay: boolean;
  /** Title-bar buttons are small; the hero's are the regular size. */
  size?: 'sm' | 'md';
  onStartGame: () => void;
  onStopGame: () => void;
  onResetGame: () => void;
}

const HubGameControls = (props: HubGameControlsProps) => {
  const { isGameRunning, showPlay, size = 'sm', onStartGame, onStopGame, onResetGame } = props;
  const { gamePaused, handleTogglePause } = useGamePause(isGameRunning);
  const [stopping, setStopping] = useState(false);
  useEffect(() => { if (!isGameRunning) setStopping(false); }, [isGameRunning]);
  const handleStop = useCallback(() => { setStopping(true); onStopGame(); }, [onStopGame]);

  if (!isGameRunning) {
    return showPlay ? <Button variant="primary" size={size} onClick={onStartGame}>▶ Play</Button> : null;
  }
  return (
    <Box className="hub-game-controls">
      <Button variant="tertiary" size={size} onClick={handleTogglePause} disabled={stopping}>
        {gamePaused ? '▶ Resume' : '⏸ Pause'}
      </Button>
      <Button variant="danger" size={size} onClick={handleStop} disabled={stopping}>
        {stopping ? <><Spinner size="sm" /> Stopping...</> : '■ Stop'}
      </Button>
      <Button variant="tertiary" size={size} onClick={onResetGame} disabled={stopping}>↻ Reset</Button>
    </Box>
  );
};

export { HubGameControls };
export type { HubGameControlsProps };
