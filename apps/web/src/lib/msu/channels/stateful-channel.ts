/* @layer renderer-lib @kind logic */
/**
 * A channel where a new id REPLACES what is playing — music, and the ambient bed.
 *
 * This is the behavior the engine used to hard-code as "the active track", lifted unchanged:
 * the same generation guard so a slow decode cannot resurrect a superseded id, the same
 * position capture on the way out, the same per-id resume map, the same instant return to full
 * gain when something starts.
 */
import { restoreFull } from '../fade';
import { createTrackLoader } from '../track-loader';
import { layerPositions, layerReports, startLayers, stopLayers } from './active-layers';
import type { ActiveLayer, ChannelOptions, ChannelReport, ChannelResume, SoundChannelApi } from './channel.type';

interface ActiveProgram {
  id: number;
  /** Context time it began, so elapsed time can be reported. */
  startedAt: number;
  layers: ActiveLayer[];
}

const createStatefulChannel = (options: ChannelOptions): SoundChannelApi => {
  const { ctx, destination, name, programs, loadBytes, cacheLimit, resumeEnabled, onError, onStart } = options;

  const fadeGain = ctx.createGain();
  fadeGain.connect(destination);

  const loader = createTrackLoader(ctx, loadBytes, onError, cacheLimit);
  const byId = new Map(programs.map((program) => [program.id, program]));
  const resumeById = new Map<number, ChannelResume>();

  let active: ActiveProgram | null = null;
  // Ids can arrive faster than one decodes; only the newest may take effect.
  let generation = 0;

  const snapshot = (): ChannelResume | null =>
    active ? { id: active.id, layers: layerPositions(active.layers) } : null;

  const stopActive = (): ChannelResume | null => {
    if (!active) return null;
    // Capture before tearing down, so leaving an area remembers where its audio was.
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
    if (mine !== generation) return; // superseded while decoding

    const startedAt = ctx.currentTime;
    const layers = startLayers({
      ctx,
      destination: fadeGain,
      program,
      loaded,
      elapsedSeconds: () => ctx.currentTime - startedAt,
      resumeFor: (layer) => resume?.layers[layer.id] ?? null,
    });

    active = { id, startedAt, layers };
    restoreFull(fadeGain, ctx.currentTime);
    onStart?.(id, layers.length, resume !== null);
  };

  /** Select an id, replacing whatever is playing. 0 means silence, as does an unauthored id. */
  const trigger = (id: number): void => {
    if (active?.id === id) return; // already playing this
    generation += 1;
    stopActive();
    if (id === 0) return;
    // Positions are always recorded; the setting decides whether re-entry uses them.
    void start(id, resumeEnabled?.() ? resumeById.get(id) ?? null : null);
  };

  const restore = (state: ChannelResume | null): void => {
    generation += 1;
    stopActive();
    if (!state) return;
    resumeById.set(state.id, state);
    void start(state.id, state);
  };

  /**
   * What every layer is doing right now. Polled by the studio's preview so a wait the scheduler
   * chose at random is visible rather than being an unexplained silence.
   */
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

  const stop = (): void => { generation += 1; stopActive(); };

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
    report,
    stop,
    dispose,
  };
};

export { createStatefulChannel };
