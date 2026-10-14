/* @layer renderer-lib @kind logic */
import type { MsuResumeState } from '@rotp/game-data';
import type { SoundChannelApi } from '../channel';

const restoreMsu = (music: SoundChannelApi, ambient: SoundChannelApi, state: MsuResumeState | null): void => {
  music.restore(state ? { id: state.trackNum, layers: state.layers } : null);
  const savedBeforeBedsResumed = state?.ambient === undefined;
  if (savedBeforeBedsResumed) return;
  ambient.restore(state.ambient ? { id: state.ambient.soundId, layers: state.ambient.layers } : null);
};

export { restoreMsu };
