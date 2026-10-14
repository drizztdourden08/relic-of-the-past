/* @layer renderer-lib @kind logic */
import type { SoundChannelApi } from '../channel';
import type { TrackReport } from '../engine.type';

const reportTrack = (music: SoundChannelApi): TrackReport | null => {
  const state = music.report();
  if (!state) return null;
  return { trackNum: state.id, elapsedSeconds: state.elapsedSeconds, layers: state.layers };
};

export { reportTrack };
