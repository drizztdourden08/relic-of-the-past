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
import type { MsuLayer } from '@shared/types/msu-manifest';
import type { ActiveLayer, ChannelOptions, ChannelReport, ChannelResume, SoundChannelApi } from './channel.type';

interface ActiveProgram {
  id: number;
  /** Context time it began, so elapsed time can be reported. */
  startedAt: number;
  layers: ActiveLayer[];
}

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

  // The id being started while its audio still decodes. A repeat of it must be absorbed the same
  // as a repeat of the active id: the game writes an ambient id in bursts, and a second write
  // arriving mid-decode would supersede the first start — and with it whatever position the first
  // was carrying across.
  let pendingId: number | null = null;

  const start = async (id: number, resume: ChannelResume | null): Promise<void> => {
    const mine = generation;
    const program = byId.get(id);
    if (!program) return;

    const loaded = await loader.load(id, program.layers);
    if (mine !== generation) return; // superseded while decoding

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

  /**
   * Select an id, replacing whatever is playing. 0 means silence, as does an unauthored id.
   *
   * What a select of the id ALREADY playing means is the channel's contract, set at build time,
   * because the two channels built on this differ. The sound chip's ports are edge-triggered:
   * a port rewritten with the value it already holds does nothing. The game rewrites the ambient
   * id on every screen transition, so for the bed a repeat has to be a no-op or the rain would
   * restart at every screen edge. Music is different: the game filters its own repeats, and the
   * one that still arrives follows a fade to zero — leaving a building fades the music out, then
   * the overworld selects the same track again — and only a fresh start brings its gain back.
   * Skipping that one left the music silent outside.
   */

  /**
   * The positions the incoming id should pick up from the outgoing one, when the two share a
   * sync group — or null when they do not, and the switch is an ordinary restart.
   *
   * Layers are matched by what they PLAY — the files and the mode — not by their ids, which are
   * different between two sound definitions by construction. A matched layer continues from the
   * outgoing layer's exact position, pending timer included, so a storm crossing a doorway keeps
   * its rain where it was and its next thunder on schedule; an unmatched layer starts or stops
   * the ordinary way, which is how one side of the doorway gets a layer the other does not.
   */
  const carriedAcross = (id: number): ChannelResume | null => {
    if (!active) return null;
    const from = byId.get(active.id);
    const to = byId.get(id);
    if (!from?.group || from.group !== to?.group) return null;
    const positions = layerPositions(active.layers);
    const signature = (layer: MsuLayer): string => JSON.stringify([layer.files, layer.mode]);
    const outgoingBySignature = new Map(from.layers.map((layer) => [signature(layer), layer.id]));
    const layers: ChannelResume['layers'] = {};
    for (const layer of to.layers) {
      const outgoingId = outgoingBySignature.get(signature(layer));
      if (outgoingId !== undefined && positions[outgoingId]) layers[layer.id] = positions[outgoingId];
    }
    return Object.keys(layers).length > 0 ? { id, layers } : null;
  };

  const trigger = (id: number): void => {
    if (!restartOnRepeat && (active?.id === id || pendingId === id)) return;
    // Continuity outranks the resume setting: it is not a convenience to toggle but what makes
    // two definitions of one soundscape read as the same weather.
    const carried = carriedAcross(id);
    generation += 1;
    stopActive();
    pendingId = id === 0 ? null : id;
    if (id === 0) return;
    // Positions are always recorded; the setting decides whether re-entry uses them.
    void start(id, carried ?? (resumeEnabled?.() ? resumeById.get(id) ?? null : null));
  };

  /**
   * Forget every position this channel has recorded. What is sounding now is left alone — this
   * only decides where the NEXT selection of an id begins, which is what makes a fresh run start
   * its music at the top rather than halfway through the last one.
   */
  const forget = (): void => { resumeById.clear(); };

  const restore = (state: ChannelResume | null): void => {
    generation += 1;
    stopActive();
    pendingId = state?.id ?? null;
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
