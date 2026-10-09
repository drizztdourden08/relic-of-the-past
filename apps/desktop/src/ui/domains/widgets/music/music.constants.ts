/* @layer renderer-widgets @kind constants */
import type { MsuChannelName } from '@rotp/msu';
import type { StatusTone } from '@drizztdourden08/tessera/primitives';
import type { MusicDebugOwner } from '@rotp/msu';

const CHANNELS: readonly MsuChannelName[] = ['music', 'ambient', 'sfx1', 'sfx2'];

const CHANNEL_TITLES: Record<MsuChannelName, string> = {
  music: 'Music', ambient: 'Ambient bed', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

const OWNER_LABELS: Record<MusicDebugOwner, string> = { pack: 'MSU', chip: 'CHIP', skipped: 'SKIP' };
const OWNER_VARIANTS: Record<MusicDebugOwner, StatusTone> = {
  pack: 'success', chip: 'warning', skipped: 'neutral',
};

export { CHANNEL_TITLES, CHANNELS, OWNER_LABELS, OWNER_VARIANTS };
