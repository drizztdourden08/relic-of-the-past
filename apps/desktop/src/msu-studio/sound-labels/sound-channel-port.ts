/* @layer renderer-components @kind logic */
import type { I18n } from '@drizztdourden08/brock-core/i18n';
import type { SoundChannel } from '@rotp/game-data';
import { SOUND_CHANNEL_PORTS } from '@rotp/game-data';
import { SOUND_CHANNEL_LABELS } from '@rotp/design/packs';

const soundChannelPort = (t: I18n['t'], channel: SoundChannel): string =>
  t('msu-studio:sound.channel.port', { channel: SOUND_CHANNEL_LABELS[channel], port: SOUND_CHANNEL_PORTS[channel] });

export { soundChannelPort };
