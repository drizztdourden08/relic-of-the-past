/* @layer renderer-components @kind logic */
import type { MsuPackManifest, SoundChannel } from '@shared/types/msu-manifest';
import { soundDefsOfChannel } from './sound-defs-of-channel';

const syncGroupOf = (
  manifest: MsuPackManifest, channel: SoundChannel, soundId: number,
): string | undefined =>
  soundDefsOfChannel(manifest, channel).find((sound) => sound.soundId === soundId)?.syncGroup;

export { syncGroupOf };
