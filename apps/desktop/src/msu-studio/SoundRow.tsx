/* @layer renderer-components @kind component */
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { SoundBadges } from './SoundBadges';
import { SoundPlayButtons } from './SoundPlayButtons';
import { soundChannelPort, soundChannelTag } from './sound-labels';
import { soundRowText } from './sound-row-text';
import type { SoundRowProps } from './msu.type';

const SoundRow = (props: SoundRowProps) => {
  const { row, channel, showChannel = false, selected, chipAudible, onSelect } = props;
  const { soundId, hex, triggers, unlisted } = row;
  const { name, under } = soundRowText(row);

  return (
    <Box className={`track-list__item msu-sound-row${selected ? ' msu-sound-row--selected' : ''}`}>
      <Pressable className="msu-sound-row__main" aria-pressed={selected} onClick={() => onSelect(soundId)}>
        {showChannel && (
          <Text as="span" className="msu-sound-row__channel" title={soundChannelPort(channel)}>
            {soundChannelTag(channel)}
          </Text>
        )}
        <Text as="span" className="track-list__num">{hex}</Text>

        <Box as="span" className="msu-sound-row__ident">
          <Text as="span" className="msu-sound-row__name" title={triggers.join(', ') || undefined}>{name}</Text>
          {under.length > 0 && !unlisted && (
            <Text as="span" className="msu-sound-row__triggers">{under}</Text>
          )}
        </Box>

        <SoundBadges row={row} chipAudible={chipAudible} />
      </Pressable>
      <Box className="msu-track-row__actions">
        <SoundPlayButtons {...props} />
      </Box>
    </Box>
  );
};

export { SoundRow };
