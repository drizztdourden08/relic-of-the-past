/* @layer renderer-components @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { PlayToggleButtonsProps } from './PlayToggleButtons.type';

const PlayToggleButtons = (props: PlayToggleButtonsProps) => {
  const { subject, playLabel, hasReplacement, playing, playingOriginal, onPlay, onStop, onPlayOriginal } = props;
  const stoppable = props.stoppable ?? playing;

  return (
    <>
      {hasReplacement && (
        <IconButton
          variant="ghost"
          size="sm"
          label={stoppable ? `Stop ${subject}` : playLabel}
          active={playing}
          onClick={stoppable ? onStop : onPlay}
        >
          <Icon name={stoppable ? 'square' : 'play'} />
        </IconButton>
      )}
      <IconButton
        variant="ghost"
        size="sm"
        label={playingOriginal
          ? `Stop ${subject}`
          : `Play the sound chip's own ${subject}${hasReplacement ? ', to compare' : ''}`}
        active={playingOriginal}
        onClick={onPlayOriginal}
      >
        <Icon name={playingOriginal ? 'square' : 'volume-2'} />
      </IconButton>
    </>
  );
};

export { PlayToggleButtons };
