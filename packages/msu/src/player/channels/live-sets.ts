/* @layer renderer-lib @kind logic */
import { layersFinished, stopLayers } from './active-layers';
import { MAX_LIVE_TRIGGERS } from './additive-channel.constants';
import type { LiveSet, LiveSets } from './additive-channel.type';

const createLiveSets = (fadeGain: GainNode): LiveSets => {
  let sets: LiveSet[] = [];

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

  const add = (set: LiveSet): void => {
    sets.push(set);
    while (sets.length > MAX_LIVE_TRIGGERS) {
      const oldest = sets.shift();
      if (oldest) release(oldest);
    }
  };

  const clear = (): void => {
    sets.forEach(release);
    sets = [];
  };

  return { prune, add, clear, newest: () => sets[sets.length - 1], size: () => sets.length };
};

export { createLiveSets };
