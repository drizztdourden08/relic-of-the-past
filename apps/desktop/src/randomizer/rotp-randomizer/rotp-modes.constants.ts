/* @layer renderer-app @kind constants */
import type { RandomizerGameMode, RandomizerLabels } from '@drizztdourden08/brock-randomizer';
import { isExperimental } from '@app/shell/show-rules/is-experimental';

const ROTP_MODES: readonly RandomizerGameMode[] = [
  { id: 'online', label: 'Archipelago', rank: 100, when: isExperimental },
  { id: 'archipelia', label: 'Archipelia', rank: 200 },
];

const ROTP_LABELS: Partial<RandomizerLabels> = { modes: { online: 'Archipelago' } };

export { ROTP_LABELS, ROTP_MODES };
