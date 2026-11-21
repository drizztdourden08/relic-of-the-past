/* @layer renderer-widgets @kind constants */
import { msg } from '@drizztdourden08/brock-core/i18n';
import type { Message } from '@drizztdourden08/brock-core/i18n';
import type { MsuChannelName, MusicDebugOwner } from '@rotp/msu';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';

const CHANNELS: readonly MsuChannelName[] = ['music', 'ambient', 'sfx1', 'sfx2'];

const CHANNEL_TITLES: Record<MsuChannelName, Message> = {
  music: msg('views-music:channel.music'), ambient: msg('views-music:channel.ambient'),
  sfx1: msg('views-music:channel.sfx1'), sfx2: msg('views-music:channel.sfx2'),
};

const LAYER_SLOTS: Record<MsuChannelName, number> = { music: 3, ambient: 2, sfx1: 2, sfx2: 2 };

const OWNER_LABELS: Record<MusicDebugOwner, Message> = {
  pack: msg('views-music:owner.pack'), chip: msg('views-music:owner.chip'), skipped: msg('views-music:owner.skipped'),
};
const OWNER_VARIANTS: Record<MusicDebugOwner, StatusTone> = {
  pack: 'success', chip: 'warning', skipped: 'neutral',
};

const NONE = '-';

export { CHANNEL_TITLES, CHANNELS, LAYER_SLOTS, NONE, OWNER_LABELS, OWNER_VARIANTS };
