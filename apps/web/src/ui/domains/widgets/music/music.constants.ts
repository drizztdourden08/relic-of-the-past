/* @layer renderer-widgets @kind constants */
import type { MsuChannelName } from '@app/lib/msu/engine';
import type { BadgeVariant } from '@ds/primitives/Badge/Badge.type';
import type { MusicDebugOwner } from '@app/lib/game/music-debug';

const CHANNELS: readonly MsuChannelName[] = ['music', 'ambient', 'sfx1', 'sfx2'];

const CHANNEL_TITLES: Record<MsuChannelName, string> = {
  music: 'Music', ambient: 'Ambient bed', sfx1: 'Effects 1', sfx2: 'Effects 2',
};

const OWNER_LABELS: Record<MusicDebugOwner, string> = { pack: 'MSU', chip: 'CHIP', skipped: 'SKIP' };
const OWNER_VARIANTS: Record<MusicDebugOwner, BadgeVariant> = {
  pack: 'success', chip: 'warning', skipped: 'neutral',
};

export { CHANNEL_TITLES, CHANNELS, OWNER_LABELS, OWNER_VARIANTS };
