/* @layer renderer-components @kind logic */
import type { MsuPackManifest } from '@shared/types/msu-manifest';
import { SOUND_CHANNEL_LABELS, soundHexId } from '../../../../behavior/sound-names';
import type { SlotRow } from '../../TrackList.type';
import { filesOf } from './files-of';
import { soundsOf } from './sounds-of';

const soundRows = (manifest: MsuPackManifest): SlotRow[] => soundsOf(manifest).map(({ channel, sound }) => ({
  key: `${channel}-${sound.soundId}`,
  number: soundHexId(sound.soundId),
  title: SOUND_CHANNEL_LABELS[channel],
  layerCount: sound.layers.length,
  files: filesOf(sound.layers),
}));

export { soundRows };
