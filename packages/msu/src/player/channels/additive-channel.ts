/* @layer renderer-lib @kind logic */
import { additiveReport } from './additive-report';
import type { ChannelOptions, SoundChannelApi } from './channel.type';
import { createChannelCore } from './create-channel-core';
import { createLiveSets } from './live-sets';
import { startAdditiveSet } from './start-additive-set';
import { createTriggerPool } from './trigger-pool';

const createAdditiveChannel = (options: ChannelOptions): SoundChannelApi => {
  const { ctx, name, onStart } = options;
  const { fadeGain, loader, byId, teardown } = createChannelCore(options);
  const pool = createTriggerPool();
  const live = createLiveSets(fadeGain);

  let lastId = 0;
  let generation = 0;

  const spawn = async (id: number, pan: number): Promise<void> => {
    const mine = generation;
    const program = byId.get(id);
    if (!program) return;

    const loaded = await loader.load(id, program.layers);
    const stoppedWhileDecoding = mine !== generation;
    if (stoppedWhileDecoding || loaded.length === 0) return;

    live.prune();
    const set = startAdditiveSet({ ctx, fadeGain, name, program, loaded, pool, pan });
    live.add(set);
    onStart?.(id, set.layers.length, false);
  };

  const trigger = (id: number, pan = 0): void => {
    if (!byId.has(id)) return;
    lastId = id;
    void spawn(id, pan);
  };

  const stop = (): void => {
    generation += 1;
    live.clear();
  };

  const dispose = (): void => {
    stop();
    teardown();
  };

  return {
    kind: 'additive',
    fadeNode: fadeGain,
    trigger,
    activeId: () => (live.size() > 0 ? lastId : null),
    snapshot: () => null,
    restore: () => {},
    forget: () => {},
    report: () => additiveReport(name, ctx, live),
    stop,
    dispose,
  };
};

export { createAdditiveChannel };
