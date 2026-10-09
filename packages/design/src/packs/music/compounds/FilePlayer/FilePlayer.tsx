/* @layer renderer-components @kind component */
import { useEffect, useRef, useState } from 'react';
import { Box, ProgressBar, Text } from '@drizztdourden08/tessera/primitives';
import { clock } from '../../behavior/clock';
import type { FilePlayerProps } from './FilePlayer.type';
import './FilePlayer.css';

const FilePlayer = (props: FilePlayerProps) => {
  const { audition } = props;
  const [position, setPosition] = useState(0);
  const frame = useRef(0);

  useEffect(() => {
    const tick = (): void => {
      setPosition(audition.positionSeconds());
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame.current);
  }, [audition]);

  const { durationSeconds, loopSeconds } = audition;

  return (
    <Box className="msu-file-player">
      <ProgressBar
        value={position}
        max={Math.max(0.001, durationSeconds)}
        secondaryValue={loopSeconds ?? undefined}
        live
      />
      <Text className="msu-file-player__clock">
        {clock(position)} / {clock(durationSeconds)}
        {loopSeconds !== null && ` · repeats from ${clock(loopSeconds)}`}
      </Text>
    </Box>
  );
};

export { FilePlayer };
