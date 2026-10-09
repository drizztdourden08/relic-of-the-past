/* @layer bridge-wasm @kind logic */
import { progressTierLabel } from '@shared/game/logic/queries/progress-tier';

const phaseLabelFor = (tier: number): string => progressTierLabel(tier) ?? `unknown (${tier})`;

export { phaseLabelFor };
