/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { PlayToggleButtons } from './PlayToggleButtons';
import type { TrackActionsProps } from './TrackActions.type';

const TrackActions = (props: TrackActionsProps) => {
  const { trackNum, hasAudio, controls } = props;
  const { onPreview, onStopPreview, onPlayOriginal } = controls;

  return (
    <Box className="msu-track-row__actions">
      <PlayToggleButtons
        subject={`slot ${trackNum}`}
        playLabel={`Preview slot ${trackNum}`}
        hasReplacement={hasAudio}
        playing={controls.playing === trackNum}
        playingOriginal={controls.playingOriginal === trackNum}
        onPlay={() => onPreview(trackNum)}
        onStop={onStopPreview}
        onPlayOriginal={() => onPlayOriginal(trackNum)}
      />
    </Box>
  );
};

export { TrackActions };
