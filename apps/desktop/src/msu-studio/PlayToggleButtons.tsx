/* @layer renderer-components @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import { useT } from '@drizztdourden08/brock-react';
import type { PlayToggleButtonsProps } from './PlayToggleButtons.type';

const PlayToggleButtons = (props: PlayToggleButtonsProps) => {
  const { subject, playLabel, hasReplacement, playing, playingOriginal, onPlay, onStop, onPlayOriginal } = props;
  const t = useT();
  const stoppable = props.stoppable ?? playing;
  const originalLabel = hasReplacement
    ? t('msu-studio:play.original-compare', { subject })
    : t('msu-studio:play.original', { subject });

  return (
    <>
      {hasReplacement && (
        <IconButton
          variant="ghost"
          size="sm"
          label={stoppable ? t('msu-studio:play.stop', { subject }) : playLabel}
          active={playing}
          onClick={stoppable ? onStop : onPlay}
        >
          <Icon name={stoppable ? 'square' : 'play'} />
        </IconButton>
      )}
      <IconButton
        variant="ghost"
        size="sm"
        label={playingOriginal ? t('msu-studio:play.stop', { subject }) : originalLabel}
        active={playingOriginal}
        onClick={onPlayOriginal}
      >
        <Icon name={playingOriginal ? 'square' : 'volume-2'} />
      </IconButton>
    </>
  );
};

export { PlayToggleButtons };
