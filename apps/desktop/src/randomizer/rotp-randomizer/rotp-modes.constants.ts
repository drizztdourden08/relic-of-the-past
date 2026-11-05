/* @layer renderer-app @kind constants */
import type { RandomizerGameMode, RandomizerLabels } from '@drizztdourden08/brock-randomizer';

const ROTP_MODES: readonly RandomizerGameMode[] = [{ id: 'archipelia', label: 'Archipelia', rank: 200 }];

const ROTP_LABELS: Partial<RandomizerLabels> = { modes: { online: 'Archipelago' } };

export { ROTP_LABELS, ROTP_MODES };
