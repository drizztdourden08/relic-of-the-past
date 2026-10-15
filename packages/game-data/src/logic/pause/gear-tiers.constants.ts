/* @layer shared-game @kind constants */
import type { GearKind, GearLadderKind } from './pause.type';

const GEAR_KINDS: readonly GearKind[] = ['sword', 'shield', 'mail'];

const ARROW_LADDER = 'bow';

const GEAR_LADDER_KINDS: readonly GearLadderKind[] = [...GEAR_KINDS, ARROW_LADDER];

const TIER_RECORDS: Record<GearLadderKind, readonly (string | null)[]> = {
  sword: [null, 'item-074', 'item-002', 'item-003', 'item-004'],
  shield: [null, 'item-005', 'item-006', 'item-007'],
  mail: [null, 'item-035', 'item-036'],
  bow: ['item-012', 'item-060'],
};

const BARE_TIER_SPRITES: Record<GearLadderKind, string> = {
  sword: '',
  shield: '',
  mail: 'hud-green-mail',
  bow: '',
};

const ARROW_TYPE_STEP = 2;
const NO_ARROW_TYPE = -1;
const BARE_TIER = 0;

export { ARROW_LADDER, ARROW_TYPE_STEP, BARE_TIER, BARE_TIER_SPRITES, GEAR_LADDER_KINDS, NO_ARROW_TYPE, TIER_RECORDS };
