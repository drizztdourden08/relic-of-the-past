/* @layer renderer-lib @kind logic */
import { restoreFull } from '../fade';
import { layerPositions, stopLayers } from './active-layers';
import type { ChannelOptions, ChannelResume, SoundChannelApi } from './channel.type';
import type { ActiveProgram } from './stateful-channel.type';
import { carriedAcross } from './carried-across';
import { createChannelCore } from './create-channel-core';
import { savedResumeOf } from './saved-resume-of';
import { startProgram } from './start-program';
import { statefulReport } from './stateful-report';

const createStatefulChannel = (options: ChannelOptions): SoundChannelApi => {
  const { ctx, name, resumeEnabled, restartOnRepeat = false, onStart } = options;
  const { fadeGain, loader, byId, teardown } = createChannelCore(options);
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

    const started = await startProgram({ ctx, name, fadeGain, loader, program, resume, isCurrent: () => mine === generation });
    if (!started) return;

    active = started;
    pendingId = null;
    restoreFull(fadeGain, ctx.currentTime);
    onStart?.(id, started.layers.length, resume !== null);
  };

  const trigger = (id: number): void => {
    if (!restartOnRepeat && (active?.id === id || pendingId === id)) return;
    const carried = carriedAcross(active, byId, id);
    generation += 1;
    stopActive();
    pendingId = id === 0 ? null : id;
    if (id === 0) return;
    void start(id, carried ?? savedResumeOf(resumeEnabled, resumeById, id));
  };

  const restore = (state: ChannelResume | null): void => {
    generation += 1;
    stopActive();
    pendingId = state?.id ?? null;
    if (!state) return;
    resumeById.set(state.id, state);
    void start(state.id, state);
  };

  const stop = (): void => { generation += 1; pendingId = null; stopActive(); };

  const dispose = (): void => { stop(); teardown(); };

  return {
    kind: 'stateful',
    fadeNode: fadeGain,
    trigger,
    activeId: () => active?.id ?? null,
    snapshot,
    restore,
    forget: () => { resumeById.clear(); },
    report: () => statefulReport(name, ctx, active),
    stop,
    dispose,
  };
};

export { createStatefulChannel };
