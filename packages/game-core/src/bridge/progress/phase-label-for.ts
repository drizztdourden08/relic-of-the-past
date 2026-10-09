/* @layer bridge-wasm @kind logic */
import { progressTierLabel } from '@rotp/game-data';

const phaseLabelFor = (tier: number): string => progressTierLabel(tier) ?? `unknown (${tier})`;

export { phaseLabelFor };
