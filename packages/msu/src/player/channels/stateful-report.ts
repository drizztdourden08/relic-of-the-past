/* @layer renderer-lib @kind logic */
import { layerReports } from './active-layers';
import type { ChannelReport, MsuChannelName } from './channel.type';
import type { ActiveProgram } from './stateful-channel.type';

const statefulReport = (name: MsuChannelName, ctx: BaseAudioContext, active: ActiveProgram | null): ChannelReport | null => {
  if (!active) return null;
  return {
    channel: name,
    kind: 'stateful',
    id: active.id,
    elapsedSeconds: ctx.currentTime - active.startedAt,
    layers: layerReports(active.layers),
    setCount: 1,
    voiceCap: null,
  };
};

export { statefulReport };
