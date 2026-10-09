/* @layer renderer-lib @kind logic */
import { createTrackLoader } from '../track-loader';
import { layerReports, layersFinished, startLayers, stopLayers } from './active-layers';
import type { ChannelOptions, ChannelReport, SoundChannelApi } from './channel.type';
import type { LiveSet } from './additive-channel.type';
import { MAX_LIVE_TRIGGERS, PAN_LEFT, PAN_RIGHT } from './additive-channel.constants';
import { createTriggerPool } from './trigger-pool';

const panTo = (ctx: BaseAudioContext, destination: AudioNode, pan: number): AudioNode => {
  if (pan !== PAN_LEFT && pan !== PAN_RIGHT) return destination;
  if (typeof ctx.createStereoPanner !== 'function') return destination;
  const panner = ctx.createStereoPanner();
  panner.pan.value = pan === PAN_LEFT ? -1 : 1;
  panner.connect(destination);
  return panner;
};

const createAdditiveChannel = (options: ChannelOptions): SoundChannelApi => {
  const { ctx, destination, name, programs, loadBytes, cacheLimit, onError, onStart } = options;

  const fadeGain = ctx.createGain();
  fadeGain.connect(destination);

  const loader = createTrackLoader(ctx, loadBytes, onError, cacheLimit);
  const byId = new Map(programs.map((program) => [program.id, program]));
  const pool = createTriggerPool();

  let sets: LiveSet[] = [];
  let lastId = 0;
  let generation = 0;

  const release = (set: LiveSet): void => {
    stopLayers(set.layers);
    if (set.out !== fadeGain) set.out.disconnect();
  };

  const prune = (): void => {
    const finished = sets.filter((set) => layersFinished(set.layers));
    if (finished.length === 0) return;
    finished.forEach(release);
    sets = sets.filter((set) => !finished.includes(set));
  };

  const dropOldestOverCap = (): void => {
    while (sets.length > MAX_LIVE_TRIGGERS) {
      const oldest = sets.shift();
      if (oldest) release(oldest);
    }
  };

  const spawn = async (id: number, pan: number): Promise<void> => {
    const mine = generation;
    const program = byId.get(id);
    if (!program) return;

    const loaded = await loader.load(id, program.layers);
    const stoppedWhileDecoding = mine !== generation;
    if (stoppedWhileDecoding || loaded.length === 0) return;

    prune();
    const out = panTo(ctx, fadeGain, pan);
    const startedAt = ctx.currentTime;
    const layers = startLayers({
      ctx,
      channel: name,
      destination: out,
      program,
      loaded,
      elapsedSeconds: () => ctx.currentTime - startedAt,
      resumeFor: (layer, fileCount) => pool.pick(layer, fileCount),
    });

    sets.push({ id, startedAt, layers, out });
    dropOldestOverCap();
    onStart?.(id, layers.length, false);
  };

  const trigger = (id: number, pan = 0): void => {
    if (!byId.has(id)) return;
    lastId = id;
    void spawn(id, pan);
  };

  const stop = (): void => {
    generation += 1;
    sets.forEach(release);
    sets = [];
  };

  const report = (): ChannelReport | null => {
    prune();
    const newest = sets[sets.length - 1];
    if (!newest) return null;
    return {
      channel: name,
      kind: 'additive',
      id: newest.id,
      elapsedSeconds: ctx.currentTime - newest.startedAt,
      layers: layerReports(newest.layers),
      setCount: sets.length,
      voiceCap: MAX_LIVE_TRIGGERS,
    };
  };

  const dispose = (): void => {
    stop();
    loader.clear();
    fadeGain.disconnect();
  };

  return {
    kind: 'additive',
    fadeNode: fadeGain,
    trigger,
    activeId: () => (sets.length > 0 ? lastId : null),
    snapshot: () => null,
    restore: () => {},
    forget: () => {},
    report,
    stop,
    dispose,
  };
};

export { createAdditiveChannel };
