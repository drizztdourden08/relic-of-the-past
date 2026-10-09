/* @layer bridge-wasm @kind constants */
import type { GearLadderKind } from '@shared/game/logic/pause';

const GEAR_KIND_ARG: Record<GearLadderKind, number> = { sword: 0, shield: 1, mail: 2, bow: 3 };

const FIRST_HUD_ITEM = 1;
const LAST_HUD_ITEM = 24;
const NO_HUD_ITEM = 0;

export { GEAR_KIND_ARG, FIRST_HUD_ITEM, LAST_HUD_ITEM, NO_HUD_ITEM };
