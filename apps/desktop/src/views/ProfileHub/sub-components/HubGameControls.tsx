/* @layer renderer-components @kind component */
import { useCallback, useEffect, useState } from 'react';
import { useT } from '@drizztdourden08/brock-react';
import { Box, Button, Icon, Spinner } from '@drizztdourden08/tessera/primitives';
import { useGamePause } from '../behavior/useGamePause';
import type { HubGameControlsProps } from './HubGameControls.type';
import './HubGameControls.css';

const HubGameControls = (props: HubGameControlsProps) => {
  const { isGameRunning, showPlay, size = 'sm', onStartGame, onStopGame, onResetGame } = props;
  const { gamePaused, handleTogglePause } = useGamePause(isGameRunning);
  const t = useT();
  const [stopping, setStopping] = useState(false);
  useEffect(() => { if (!isGameRunning) setStopping(false); }, [isGameRunning]);
  const handleStop = useCallback(() => { setStopping(true); onStopGame(); }, [onStopGame]);

  if (!isGameRunning) {
    return showPlay ? <Button variant="primary" size={size} icon={<Icon name="play" />} onClick={onStartGame}>{t('profiles:game-controls.play')}</Button> : null;
  }
  return (
    <Box className="hub-game-controls">
      <Button variant="tertiary" size={size} icon={<Icon name={gamePaused ? 'play' : 'pause'} />} onClick={handleTogglePause} disabled={stopping}>
        {gamePaused ? t('profiles:game-controls.resume') : t('profiles:game-controls.pause')}
      </Button>
      <Button variant="danger" size={size} icon={stopping ? <Spinner size="sm" /> : <Icon name="square" />} onClick={handleStop} disabled={stopping}>
        {stopping ? t('profiles:game-controls.stopping') : t('profiles:game-controls.stop')}
      </Button>
      <Button variant="tertiary" size={size} icon={<Icon name="rotate-ccw" />} onClick={onResetGame} disabled={stopping}>{t('profiles:game-controls.reset')}</Button>
    </Box>
  );
};

export { HubGameControls };
