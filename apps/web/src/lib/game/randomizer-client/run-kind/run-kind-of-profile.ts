/* @layer bridge-wasm @kind logic */
import type { RunKind } from '@shared/game/logic';
import type { ProfileRandomizerConfig } from '@shared/types/profile';

const runKindOfProfile = (randomizer: ProfileRandomizerConfig | undefined): RunKind => {
  if (randomizer === undefined) return 'normal';
  return randomizer.mode === 'online' ? 'online' : 'seed';
};

export { runKindOfProfile };
