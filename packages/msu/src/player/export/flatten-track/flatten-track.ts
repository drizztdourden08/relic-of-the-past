/* @layer renderer-lib @kind logic */
import type { MsuTrackDef } from '@rotp/game-data';
import { MSU1_CHANNELS, MSU1_SAMPLE_RATE } from '../../decode/parse-msu1';
import { dominantLoopLayer, renderWindowSeconds, resolveLayers } from '../layer-window';
import type { ResolvedLayer } from '../layer-window';
import { scheduleLayer } from '../schedule-layer';
import type { FlattenOptions, FlattenedTrack } from './flatten-track.type';
import { carriedLoopPoint } from './carried-loop-point';

const emptyResult = (): FlattenedTrack => ({
  channels: [new Float32Array(0), new Float32Array(0)],
  loopSample: 0,
});

const windowSecondsFor = (layers: ResolvedLayer[], carriedBuffer: AudioBuffer | undefined): number =>
  (carriedBuffer
    ? Math.min(carriedBuffer.duration, renderWindowSeconds(layers))
    : renderWindowSeconds(layers));

const channelsOf = (rendered: AudioBuffer): Float32Array[] => {
  const channels: Float32Array[] = [];
  for (let channel = 0; channel < rendered.numberOfChannels; channel += 1) {
    channels.push(rendered.getChannelData(channel));
  }
  return channels;
};

const flattenTrack = async (track: MsuTrackDef, files: Map<string, AudioBuffer>,
  options?: FlattenOptions): Promise<FlattenedTrack> => {
  const layers = resolveLayers(track, files);
  if (layers.length === 0) return emptyResult();

  const dominant = dominantLoopLayer(layers);
  const carried = carriedLoopPoint(dominant);
  const windowSeconds = windowSecondsFor(layers, carried === null ? undefined : dominant?.buffers[0]);
  if (windowSeconds <= 0) return emptyResult();

  const frames = Math.max(1, Math.ceil(windowSeconds * MSU1_SAMPLE_RATE));
  const ctx = new OfflineAudioContext(MSU1_CHANNELS, frames, MSU1_SAMPLE_RATE);
  const seed = options?.seed ?? track.trackNum;

  for (const resolved of layers) {
    scheduleLayer(resolved, {
      ctx,
      windowSeconds,
      seed,
      singlePass: carried !== null && resolved === dominant,
    });
  }

  const rendered = await ctx.startRendering();
  return { channels: channelsOf(rendered), loopSample: carried ?? 0 };
};

export { flattenTrack };
