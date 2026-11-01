/* @layer renderer-widgets @kind constants */
import type { MsuChannelName, MusicDebugOwner } from '@rotp/msu';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';

const CHANNELS: readonly MsuChannelName[] = ['music', 'ambient', 'sfx1', 'sfx2'];

const CHANNEL_TITLES: Record<MsuChannelName, string> = {
  music: 'Music', ambient: 'Ambient bed', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

const LAYER_SLOTS: Record<MsuChannelName, number> = { music: 3, ambient: 2, sfx1: 2, sfx2: 2 };

const OWNER_LABELS: Record<MusicDebugOwner, string> = { pack: 'MSU', chip: 'CHIP', skipped: 'SKIP' };
const OWNER_VARIANTS: Record<MusicDebugOwner, StatusTone> = {
  pack: 'success', chip: 'warning', skipped: 'neutral',
};

const NONE = '-';

export { CHANNEL_TITLES, CHANNELS, LAYER_SLOTS, NONE, OWNER_LABELS, OWNER_VARIANTS };
