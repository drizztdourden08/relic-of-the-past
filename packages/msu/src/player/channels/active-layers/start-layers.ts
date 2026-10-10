/* @layer renderer-lib @kind logic */
import type { MsuLayer } from '@rotp/game-data';
import { createScheduler } from '../../schedulers/create-scheduler';
import { publishMsuDebug } from '../../debug-bus';
import type { LoadedLayer } from '../../track-loader';
import { MSU1_SAMPLE_RATE } from '../../decode/parse-msu1';
import { createVoice } from '../../voice';
import { buildEffectChain } from '../../layer-effects';
import type { ActiveLayer } from '../channel.type';
import type { StartLayersParams } from './active-layers.type';

const layerSounds = (channel: string, programId: number, layer: MsuLayer): boolean => {
  const chance = layer.chance;
  if (chance === undefined || chance >= 100) return true;
  const passed = chance > 0 && Math.random() * 100 < chance;
  publishMsuDebug({
    kind: 'roll', channel, programId,
    layerId: layer.id, layerName: layer.name, chance, passed,
  });
  return passed;
};

const loopStartSeconds = (layer: MsuLayer, entry: LoadedLayer): number =>
  (entry.files.length === 1
    ? Math.min((layer.loopSample ?? 0) / MSU1_SAMPLE_RATE, entry.files[0]?.buffer.duration ?? 0)
    : 0);

const fileAt = (entry: LoadedLayer, fileIndex: number): LoadedLayer['files'][number] => {
  const file = entry.files[fileIndex];
  if (file === undefined) throw new Error(`Layer ${String(entry.layerIndex)} has no file ${String(fileIndex)}`);
  return file;
};

const startLayers = (params: StartLayersParams): ActiveLayer[] => {
  const { ctx, destination, channel, program, loaded, elapsedSeconds, resumeFor } = params;
  const layers: ActiveLayer[] = [];

  for (const entry of loaded) {
    const layer = program.layers[entry.layerIndex];
    if (layer === undefined) throw new Error(`Program ${String(program.id)} has no layer ${String(entry.layerIndex)}`);
    if (!layerSounds(channel, program.id, layer)) continue;
    const effects = buildEffectChain(ctx, destination, layer.effects);
    const gain = ctx.createGain();
    gain.gain.value = layer.volume / 100;
    gain.connect(effects.input);

    const loopSeconds = loopStartSeconds(layer, entry);

    const scheduler = createScheduler(layer.mode, {
      files: entry.files,
      fileNames: entry.fileNames,
      elapsedSeconds,
      loopSeconds,
      play: (fileIndex, opts) => createVoice(ctx, gain, fileAt(entry, fileIndex), {
        ...opts,
        loopSecondsOverride: loopSeconds > 0 ? loopSeconds : opts.loopSecondsOverride,
      }),
    });
    scheduler.start(resumeFor(layer, entry.files.length));
    layers.push({ layerId: layer.id, layerName: layer.name, modeKind: layer.mode.kind, scheduler, gain, effects });
  }

  return layers;
};

export { startLayers };
