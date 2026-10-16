/* @layer renderer-components @kind component */
import { SoundRow } from './SoundRow';
import { soundPreviewKey } from './behavior/preview-key';
import { isAdditiveChannel } from './behavior/sound-channel-kind';
import type { SoundListItemProps } from './msu.type';

const SoundListItem = (props: SoundListItemProps) => {
  const { channel, row, sound, showChannel = false, onSelect, onPreview, onPlayOriginal } = props;

  return (
    <SoundRow
      row={row}
      channel={channel}
      showChannel={showChannel}
      selected={sound.openSound === row.soundId}
      playing={sound.playing === soundPreviewKey(channel, row.soundId)}
      additive={isAdditiveChannel(channel)}
      playingOriginal={sound.playingOriginal === row.soundId}
      chipAudible={sound.chipAudible(row.soundId)}
      onSelect={(soundId) => onSelect(channel, soundId)}
      onPreview={onPreview}
      onStopPreview={sound.stop}
      onPlayOriginal={(soundId) => onPlayOriginal(channel, soundId)}
    />
  );
};

export { SoundListItem };
