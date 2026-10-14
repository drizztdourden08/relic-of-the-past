/* @layer renderer-components @kind component */
import { Box, Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { TrackActionsProps } from './TrackActions.type';

const TrackActions = (props: TrackActionsProps) => {
  const {
    trackNum, fileName, playing, busy, expanded, playingOriginal,
    onPreview, onStopPreview, onPlayOriginal, onToggleLayers,
  } = props;
  const hasAudio = fileName !== null;

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
      <IconButton
        variant="ghost"
        size="sm"
        label={`Layers and audio for slot ${trackNum}`}
        active={expanded}
        disabled={busy}
        onClick={() => onToggleLayers(trackNum)}
      >
        <Icon name="layers" />
      </IconButton>
    </Box>
  );
};

export { TrackActions };
