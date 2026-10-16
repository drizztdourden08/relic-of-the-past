/* @layer renderer-components @kind component */
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { TrackActionsProps } from './TrackActions.type';

const TrackActions = (props: TrackActionsProps) => {
  const { trackNum, hasAudio, controls } = props;
  const { onPreview, onStopPreview, onPlayOriginal } = controls;
  const playing = controls.playing === trackNum;
  const playingOriginal = controls.playingOriginal === trackNum;

  return (
    <Box className="msu-track-row__actions">
      {hasAudio && (
        <IconButton
          variant="ghost"
          size="sm"
          label={playing ? `Stop slot ${trackNum}` : `Preview slot ${trackNum}`}
          active={playing}
          onClick={() => (playing ? onStopPreview() : onPreview(trackNum))}
        >
          <Icon name={playing ? 'square' : 'play'} />
        </IconButton>
      )}
      <IconButton
        variant="ghost"
        size="sm"
        label={playingOriginal
          ? `Stop slot ${trackNum}`
          : `Play the sound chip's own slot ${trackNum}${hasAudio ? ', to compare' : ''}`}
        active={playingOriginal}
        onClick={() => onPlayOriginal(trackNum)}
      >
        <Icon name={playingOriginal ? 'square' : 'volume-2'} />
      </IconButton>
    </Box>
  );
};

export { TrackActions };
