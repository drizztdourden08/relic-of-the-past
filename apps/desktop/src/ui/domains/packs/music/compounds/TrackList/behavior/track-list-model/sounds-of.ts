/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { SOUND_CHANNELS } from '../../../../behavior/sound-names';
import type { ChannelSound } from '../../TrackList.type';

const soundsOf = (manifest: MsuPackManifest): ChannelSound[] =>
  SOUND_CHANNELS.flatMap((channel) => (manifest.sounds?.[channel] ?? []).map((sound) => ({ channel, sound })));

export { soundsOf };
