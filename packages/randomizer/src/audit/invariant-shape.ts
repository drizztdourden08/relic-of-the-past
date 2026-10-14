/* @layer shared-game @kind logic */
import { MAX_CHEST_INDEX, MAX_ROOM_ID, SHAPE_RULE } from './invariant.constants';
import type { CheckGameId, CheckKind, CheckRecord } from '@rotp/game-data';
import type { InvariantFinding, InvariantInput, KindRule } from './invariant.type';

const finding = (checkId: string, detail: string): InvariantFinding =>
  ({ rule: SHAPE_RULE, checkId, field: 'gameId', detail });

const hasRoomBit = (g: CheckGameId): boolean =>
  g.roomId !== undefined && (g.chestIndex !== undefined || g.mask !== undefined);

const hasOwBit = (g: CheckGameId): boolean => g.owScreen !== undefined && g.mask !== undefined;

const hasProgressBufferBit = (g: CheckGameId): boolean =>
  g.owScreen === undefined && g.roomId === undefined
  && g.bufferIndex !== undefined && g.mask !== undefined;

const isEmptyGameId = (g: CheckGameId): boolean =>
  Object.values(g).every((v) => v === undefined);

const chestErrors: KindRule = (_check, g) => {
  const errors: string[] = [];
  if (g.roomId === undefined || g.roomId < 0 || g.roomId > MAX_ROOM_ID) errors.push(`chest needs roomId in 0..0x13F (got ${g.roomId})`);
  if (g.chestIndex === undefined || g.chestIndex < 0 || g.chestIndex > MAX_CHEST_INDEX) errors.push(`chest needs chestIndex in 0..5 (got ${g.chestIndex})`);
  if (g.mask !== undefined) errors.push('chest must not carry a mask');
  return errors;
};

const maskedErrors: KindRule = (check, g) => {
  const errors: string[] = [];
  if (g.roomId === undefined) errors.push(`${check.kind} needs roomId`);
  if (g.mask === undefined || g.mask <= 0) errors.push(`${check.kind} needs mask > 0 (got ${g.mask})`);
  if (g.chestIndex !== undefined) errors.push(`${check.kind} must not carry a chestIndex`);
  return errors;
};

const spotErrors: KindRule = (check, g) => (
  !hasRoomBit(g) && !hasOwBit(g) && !hasProgressBufferBit(g)
    ? [`${check.kind} needs roomId+chestIndex, roomId+mask, owScreen+mask, or bufferIndex+mask`]
    : []
);

const npcErrors: KindRule = (_check, g) => (
  g.bufferIndex === undefined && g.flagType === undefined && g.flagMask === undefined && g.roomFlag === undefined
    ? ['npc needs bufferIndex, flagType/flagMask, or roomFlag']
    : []
);

const eventErrors: KindRule = (_check, g) => (g.bufferIndex === undefined ? ['event needs bufferIndex'] : []);

const potItemErrors: KindRule = (_check, g) => (hasRoomBit(g) ? [] : ['potItem needs roomId plus mask or chestIndex']);

const noErrors: KindRule = () => [];

const kindRules: Record<CheckKind, KindRule> = {
  chest: chestErrors,
  keyDrop: maskedErrors,
  boss: maskedErrors,
  standing: spotErrors,
  dig: spotErrors,
  bonk: spotErrors,
  npc: npcErrors,
  event: eventErrors,
  potItem: potItemErrors,
  prize: noErrors,
  'shop-slot': noErrors,
  'pond-slot': noErrors,
};

const shapeErrors = (check: CheckRecord): string[] => {
  const g = check.gameId;
  const errors = kindRules[check.kind](check, g);
  if (check.kind !== 'prize' && check.kind !== 'event' && isEmptyGameId(g)) {
    errors.push('gameId is entirely empty');
  }
  return errors;
};

const checkShapes = ({ checks }: InvariantInput): InvariantFinding[] =>
  checks.flatMap((check) => shapeErrors(check).map((detail) => finding(check.id, detail)));

export { checkShapes };
