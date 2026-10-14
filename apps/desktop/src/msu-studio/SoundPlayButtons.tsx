/* @layer renderer-components @kind component */
import { Icon, IconButton } from '@drizztdourden08/tessera/primitives';
import type { SoundPlayButtonsProps } from './SoundPlayButtons.type';

const SoundPlayButtons = (props: SoundPlayButtonsProps) => {
  const { row, channel, playing, additive, playingOriginal, onPreview, onStopPreview, onPlayOriginal } = props;
  const { soundId, hex, layerCount } = row;
  const replaced = layerCount > 0;
  const stoppable = playing && !additive;

  return (
    <>
      {replaced && (
        <IconButton
          variant="ghost"
          size="sm"
          label={stoppable ? `Stop ${hex}` : `Play this pack's ${hex}`}
          active={playing}
          onClick={() => (stoppable ? onStopPreview() : onPreview(channel, soundId))}
        >
          <Icon name={stoppable ? 'square' : 'play'} />
        </IconButton>
      )}
      <IconButton
        variant="ghost"
        size="sm"
        label={playingOriginal
          ? `Stop ${hex}`
          : `Play the sound chip's own ${hex}${replaced ? ', to compare' : ''}`}
        active={playingOriginal}
        onClick={() => onPlayOriginal(soundId)}
      >
        <Icon name={playingOriginal ? 'square' : 'volume-2'} />
      </IconButton>
    </>
  );
};

export { SoundPlayButtons };
