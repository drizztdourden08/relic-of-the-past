/* @layer bridge-wasm @kind logic */
import type { RunKind } from '@rotp/game-data';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

const runKindOfProfile = (randomizer: ProfileRandomizerConfig | undefined): RunKind => {
  if (randomizer === undefined) return 'normal';
  return randomizer.mode === 'online' ? 'online' : 'seed';
};

export { runKindOfProfile };
