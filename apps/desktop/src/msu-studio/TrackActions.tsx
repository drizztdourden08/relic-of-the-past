/* @layer renderer-components @kind component */
import { Box } from '@drizztdourden08/tessera/primitives';
import { PlayToggleButtons } from './PlayToggleButtons';
import { useT } from '@drizztdourden08/brock-react';
import type { TrackActionsProps } from './TrackActions.type';

const TrackActions = (props: TrackActionsProps) => {
  const { trackNum, hasAudio, controls } = props;
  const { onPreview, onStopPreview, onPlayOriginal } = controls;
  const t = useT();

  return (
    <Box className="msu-track-row__actions">
      <PlayToggleButtons
        subject={t('msu-studio:track.label', { number: trackNum })}
        playLabel={t('msu-studio:track.preview', { number: trackNum })}
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
