/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileRandomizerConfig } from '@app/profiles/types';

const buildRunFacts = (randomizer: ProfileRandomizerConfig): FactsPanelFact[] => [
  { label: 'Seed', value: randomizer.seed, mono: true, copyable: true },
  { label: 'Type', value: randomizer.mode === 'online' ? 'Archipelago' : 'Local' },
];

export { buildRunFacts };
