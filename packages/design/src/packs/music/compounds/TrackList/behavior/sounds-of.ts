/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@rotp/game-data';
import { SOUND_CHANNELS } from '../../../behavior/sound-names/index';
import type { ChannelSound } from '../TrackList.type';

const soundsOf = (manifest: MsuPackManifest): ChannelSound[] =>
  SOUND_CHANNELS.flatMap((channel) => (manifest.sounds?.[channel] ?? []).map((sound) => ({ channel, sound })));

export { soundsOf };
