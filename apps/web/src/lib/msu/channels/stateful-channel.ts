/* @layer renderer-lib @kind logic */
import { restoreFull } from '../fade';
import { createTrackLoader } from '../track-loader';
import { layerPositions, layerReports, startLayers, stopLayers } from './active-layers';
import type { ChannelOptions, ChannelReport, ChannelResume, SoundChannelApi } from './channel.type';
import type { ActiveProgram } from './stateful-channel.type';
import { carriedAcross } from './carried-across';

const createStatefulChannel = (options: ChannelOptions): SoundChannelApi => {
  const {
    ctx, destination, name, programs, loadBytes, cacheLimit, resumeEnabled, restartOnRepeat = false,
    onError, onStart,
  } = options;

  const fadeGain = ctx.createGain();
  fadeGain.connect(destination);

  const loader = createTrackLoader(ctx, loadBytes, onError, cacheLimit);
  const byId = new Map(programs.map((program) => [program.id, program]));
  const resumeById = new Map<number, ChannelResume>();

  let active: ActiveProgram | null = null;
  let generation = 0;
  let pendingId: number | null = null;

  const snapshot = (): ChannelResume | null =>
    active ? { id: active.id, layers: layerPositions(active.layers) } : null;

  const stopActive = (): ChannelResume | null => {
    if (!active) return null;
    const state = snapshot();
    stopLayers(active.layers);
    if (state) resumeById.set(state.id, state);
    active = null;
    return state;
  };

  const start = async (id: number, resume: ChannelResume | null): Promise<void> => {
    const mine = generation;
    const program = byId.get(id);
    if (!program) return;

    const loaded = await loader.load(id, program.layers);
    const supersededWhileDecoding = mine !== generation;
    if (supersededWhileDecoding) return;

    const startedAt = ctx.currentTime;
    const layers = startLayers({
      ctx,
      channel: name,
      destination: fadeGain,
      program,
      loaded,
      elapsedSeconds: () => ctx.currentTime - startedAt,
      resumeFor: (layer) => resume?.layers[layer.id] ?? null,
    });

    active = { id, startedAt, layers };
    pendingId = null;
    restoreFull(fadeGain, ctx.currentTime);
    onStart?.(id, layers.length, resume !== null);
  };

  const trigger = (id: number): void => {
    if (!restartOnRepeat && (active?.id === id || pendingId === id)) return;
    const carried = carriedAcross(active, byId, id);
    generation += 1;
    stopActive();
    pendingId = id === 0 ? null : id;
    if (id === 0) return;
    void start(id, carried ?? (resumeEnabled?.() ? resumeById.get(id) ?? null : null));
  };

  const forget = (): void => { resumeById.clear(); };

  const restore = (state: ChannelResume | null): void => {
    generation += 1;
    stopActive();
    pendingId = state?.id ?? null;
    if (!state) return;
    resumeById.set(state.id, state);
    void start(state.id, state);
  };

  const report = (): ChannelReport | null => {
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

  const stop = (): void => { generation += 1; pendingId = null; stopActive(); };

  const dispose = (): void => {
    stop();
    loader.clear();
    fadeGain.disconnect();
  };

  return {
    kind: 'stateful',
    fadeNode: fadeGain,
    trigger,
    activeId: () => active?.id ?? null,
    snapshot,
    restore,
    forget,
    report,
    stop,
    dispose,
  };
};

export { createStatefulChannel };
