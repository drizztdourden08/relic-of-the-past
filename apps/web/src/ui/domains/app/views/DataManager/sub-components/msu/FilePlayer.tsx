/* @layer renderer-components @kind component */
/**
 * The small player that opens inside a file's card while it is being auditioned.
 *
 * It samples the playhead itself, on a frame loop, because the position is the only thing here
 * that changes continuously and it belongs to this one row. Lifting it into the list's state would
 * re-render every other row sixty times a second to move one bar.
 *
 * The bar is marked `live` for the same reason the preview meters are: its width is re-targeted
 * every frame, and a CSS transition chasing a moving target lags behind the audio and overshoots
 * the end.
 *
 * The repeat point shades the stretch before it on the same bar, so the part that plays once is
 * read against the whole length, not as a number to compare by hand.
 */
import { useEffect, useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { ProgressBar } from '@ds/primitives/ProgressBar';
import { Text } from '@ds/primitives/Text';
import { clock } from './behavior/clock';
import type { Audition } from './behavior/file-audition';

interface FilePlayerProps {
  audition: Audition;
}

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
export type { FilePlayerProps };
