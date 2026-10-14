/* @layer renderer-components @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { SoundActions } from './SoundActions';
import { SoundBadges } from './SoundBadges';
import { soundChannelPort, soundChannelTag } from './sound-labels';
import { soundRowText } from './sound-row-text';
import type { SoundRowProps } from './msu.type';

const SoundRow = (props: SoundRowProps) => {
  const { row, channel, showChannel = false, expanded, chipAudible } = props;
  const { hex, triggers, unlisted } = row;
  const { name, under } = soundRowText(row);

  return (
    <Box className={`track-list__item msu-sound-row${expanded ? ' msu-sound-row--open' : ''}`}>
      {showChannel && (
        <Text className="msu-sound-row__channel" title={soundChannelPort(channel)}>
          {soundChannelTag(channel)}
        </Text>
      )}
      <Text className="track-list__num">{hex}</Text>

      <Box className="msu-sound-row__ident">
        <Text className="msu-sound-row__name" title={triggers.join(', ') || undefined}>{name}</Text>
        {under.length > 0 && !unlisted && (
          <Text className="msu-sound-row__triggers">{under}</Text>
        )}
      </Box>

      <SoundBadges row={row} chipAudible={chipAudible} />
      <SoundActions {...props} />
    </Box>
  );
};

export { SoundRow };
