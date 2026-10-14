/* @layer renderer-lib @kind logic */
import { layerReports } from './active-layers';
import { MAX_LIVE_TRIGGERS } from './additive-channel.constants';
import type { LiveSets } from './additive-channel.type';
import type { ChannelReport, MsuChannelName } from './channel.type';

const additiveReport = (name: MsuChannelName, ctx: BaseAudioContext, live: LiveSets): ChannelReport | null => {
  live.prune();
  const newest = live.newest();
  if (!newest) return null;
  return {
    channel: name,
    kind: 'additive',
    id: newest.id,
    elapsedSeconds: ctx.currentTime - newest.startedAt,
    layers: layerReports(newest.layers),
    setCount: live.size(),
    voiceCap: MAX_LIVE_TRIGGERS,
  };
};

export { additiveReport };
