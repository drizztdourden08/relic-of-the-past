/* @layer renderer-lib @kind logic */
/**
 * Building, reading and tearing down the layers of one sounding program.
 *
 * This is the exact sequence the engine used to run inline for a music track — a gain node at
 * the layer's own volume, a scheduler for its play mode, a voice factory bound to that gain.
 * Both channel kinds need it identically, so it lives here once rather than being reimplemented
 * per kind and drifting.
 */
import type { LayerResume, MsuLayer } from '@shared/types/msu-manifest';
import { createScheduler } from '../schedulers/create-scheduler';
import type { LoadedLayer } from '../track-loader';
import { MSU1_SAMPLE_RATE } from '../decode/parse-msu1';
import { createVoice } from '../voice';
import { buildEffectChain } from '../layer-effects';
import type { ActiveLayer, ChannelResume, LayerReport, SoundProgram } from './channel.type';

/**
 * Where a layer should begin. Music answers from a resume snapshot; an additive channel answers
 * with the file it picked for this trigger; both mean "start here", so one seam serves both.
 * `fileCount` is what actually decoded, which can be fewer files than the layer authored.
 */
type ResumeFor = (layer: MsuLayer, fileCount: number) => LayerResume | null;

const startLayers = (params: {
  ctx: BaseAudioContext;
  destination: AudioNode;
  program: SoundProgram;
  loaded: LoadedLayer[];
  elapsedSeconds: () => number;
  resumeFor: ResumeFor;
}): ActiveLayer[] => {
  const { ctx, destination, program, loaded, elapsedSeconds, resumeFor } = params;
  const layers: ActiveLayer[] = [];

  for (const entry of loaded) {
    const layer = program.layers[entry.layerIndex];
    // Volume first, then the layer's effects, then the channel: the chain is where one recording
    // becomes its indoor or distant version, so it sits on the layer and not on the channel.
    const effects = buildEffectChain(ctx, destination, layer.effects);
    const gain = ctx.createGain();
    gain.gain.value = layer.volume / 100;
    gain.connect(effects.input);

    // Where each repeat starts. A pool restarts every file from its top, so this only applies to a
    // single-file layer — the same rule the exporter follows, so a pack sounds the same either way.
    const loopSeconds = entry.files.length === 1
      ? Math.min(
        (layer.loopSample ?? 0) / MSU1_SAMPLE_RATE,
        entry.files[0]?.buffer.duration ?? 0,
      )
      : 0;

    const scheduler = createScheduler(layer.mode, {
      files: entry.files,
      fileNames: entry.fileNames,
      elapsedSeconds,
      loopSeconds,
      play: (fileIndex, opts) => createVoice(ctx, gain, entry.files[fileIndex], {
        ...opts,
        loopSecondsOverride: loopSeconds > 0 ? loopSeconds : opts.loopSecondsOverride,
      }),
    });
    scheduler.start(resumeFor(layer, entry.files.length));
    layers.push({ layerId: layer.id, layerName: layer.name, modeKind: layer.mode.kind, scheduler, gain, effects });
  }

  return layers;
};

const stopLayers = (layers: ActiveLayer[]): void => {
  for (const entry of layers) {
    entry.scheduler.stop();
    entry.gain.disconnect();
    entry.effects.dispose();
  }
};

/** Live positions of every layer, safe to read while playback continues. */
const layerPositions = (layers: ActiveLayer[]): ChannelResume['layers'] => {
  const positions: ChannelResume['layers'] = {};
  for (const entry of layers) positions[entry.layerId] = entry.scheduler.position();
  return positions;
};

const layerReports = (layers: ActiveLayer[]): LayerReport[] => layers.map((entry) => ({
  layerId: entry.layerId,
  layerName: entry.layerName,
  modeKind: entry.modeKind,
  ...entry.scheduler.activity(),
}));

/**
 * True when a set has nothing audible AND nothing scheduled — a one-shot that has played out.
 * A `random` or `interval` layer waiting between events reports a countdown, so it is never
 * mistaken for finished and swept away mid-cycle.
 */
const layersFinished = (layers: ActiveLayer[]): boolean => layers.every((entry) => {
  const activity = entry.scheduler.activity();
  return !activity.sounding && activity.nextEventInSeconds === null;
});

export { startLayers, stopLayers, layerPositions, layerReports, layersFinished };
export type { ResumeFor };
