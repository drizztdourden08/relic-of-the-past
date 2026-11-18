/* @layer renderer-components @kind component */
import { PlayToggleButtons } from './PlayToggleButtons';
import { useT } from '@drizztdourden08/brock-react';
import type { SoundPlayButtonsProps } from './SoundPlayButtons.type';

const SoundPlayButtons = (props: SoundPlayButtonsProps) => {
  const { row, channel, playing, additive, playingOriginal, onPreview, onStopPreview, onPlayOriginal } = props;
  const { soundId, hex, layerCount } = row;
  const t = useT();

  return (
    <PlayToggleButtons
      subject={hex}
      playLabel={t('msu-studio:play.preview-pack', { subject: hex })}
      hasReplacement={layerCount > 0}
      playing={playing}
      stoppable={playing && !additive}
      playingOriginal={playingOriginal}
      onPlay={() => onPreview(channel, soundId)}
      onStop={onStopPreview}
      onPlayOriginal={() => onPlayOriginal(soundId)}
    />
  );
};

export { SoundPlayButtons };
