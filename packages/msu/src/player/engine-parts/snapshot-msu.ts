/* @layer renderer-lib @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import type { SoundChannelApi } from '../channel';

const snapshotMsu = (music: SoundChannelApi, ambient: SoundChannelApi): MsuResumeState | null => {
  const track = music.snapshot();
  if (!track) return null;
  const bed = ambient.snapshot();
  return {
    trackNum: track.id,
    layers: track.layers,
    ambient: bed ? { soundId: bed.id, layers: bed.layers } : null,
  };
};

export { snapshotMsu };
