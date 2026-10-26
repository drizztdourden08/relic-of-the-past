/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { RUN_TYPE_LABELS } from './build-run-facts.constants';

const buildRunFacts = (randomizer: ProfileRandomizerConfig): FactsPanelFact[] => [
  { label: 'Seed', value: randomizer.seed, mono: true, copyable: true },
  { label: 'Type', value: RUN_TYPE_LABELS[randomizer.mode] },
];

export { buildRunFacts };
