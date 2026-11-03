/* @layer renderer-components @kind logic */
import type { FactsPanelFact } from '@drizztdourden08/tessera/composites';
import type { ProfileRandomizerConfig } from '@app/profiles/types';
import { NONE, RUN_TYPE_LABELS } from './build-run-facts.constants';

const connectionFacts = (randomizer: ProfileRandomizerConfig): FactsPanelFact[] => [
  ...(randomizer.serverUrl ? [{ label: 'Server', value: randomizer.serverUrl, mono: true }] : []),
  { label: 'Name', value: randomizer.slotName ?? NONE },
  ...(randomizer.mode === 'online' ? [{ label: 'Password', value: randomizer.password ? 'Set' : NONE }] : []),
  { label: 'Death Link', value: randomizer.deathLink ? 'On' : 'Off' },
];

const buildRunFacts = (randomizer: ProfileRandomizerConfig): FactsPanelFact[] => [
  { label: 'Seed', value: randomizer.seed, mono: true, copyable: true },
  { label: 'Type', value: RUN_TYPE_LABELS[randomizer.mode] },
  ...(randomizer.mode === 'local' ? [] : connectionFacts(randomizer)),
];

export { buildRunFacts };
