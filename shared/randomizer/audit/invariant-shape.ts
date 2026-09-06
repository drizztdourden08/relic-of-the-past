/* @layer shared-game @kind logic */
/**
 * A1-shape — every check's gameId must carry the physical keys its kind
 * demands, and nothing contradictory. A check with no physical identity at
 * all is flagged unless its kind legitimately has none.
 */
import type { CheckGameId, CheckRecord } from '../../game/data/types';
import type { InvariantFinding, InvariantInput } from './invariant-types';

const RULE = 'A1-shape';
const MAX_ROOM_ID = 0x13f;
const MAX_CHEST_INDEX = 5;

const finding = (checkId: string, detail: string): InvariantFinding =>
  ({ rule: RULE, checkId, field: 'gameId', detail });

const hasRoomBit = (g: CheckGameId): boolean =>
  g.roomId !== undefined && (g.chestIndex !== undefined || g.mask !== undefined);

const hasOwBit = (g: CheckGameId): boolean => g.owScreen !== undefined && g.mask !== undefined;

/**
 * A progress-buffer bit — the detection of the receive-crossing standing
 * grants (the two tablets) whose only persisted completion fact is their
 * substitution-completion bit exposed through the progress buffer.
 */
const hasProgressBit = (g: CheckGameId): boolean =>
  g.owScreen === undefined && g.roomId === undefined
  && g.bufferIndex !== undefined && g.mask !== undefined;

const isEmptyGameId = (g: CheckGameId): boolean =>
  Object.values(g).every((v) => v === undefined);

const shapeErrors = (check: CheckRecord): string[] => {
  const g = check.gameId;
  const errors: string[] = [];
  switch (check.kind) {
    case 'chest':
      if (g.roomId === undefined || g.roomId < 0 || g.roomId > MAX_ROOM_ID) errors.push(`chest needs roomId in 0..0x13F (got ${g.roomId})`);
      if (g.chestIndex === undefined || g.chestIndex < 0 || g.chestIndex > MAX_CHEST_INDEX) errors.push(`chest needs chestIndex in 0..5 (got ${g.chestIndex})`);
      if (g.mask !== undefined) errors.push('chest must not carry a mask');
      break;
    case 'keyDrop':
    case 'boss':
      if (g.roomId === undefined) errors.push(`${check.kind} needs roomId`);
      if (g.mask === undefined || g.mask <= 0) errors.push(`${check.kind} needs mask > 0 (got ${g.mask})`);
      if (g.chestIndex !== undefined) errors.push(`${check.kind} must not carry a chestIndex`);
      break;
    case 'standing':
    case 'dig':
    case 'bonk':
      if (!hasRoomBit(g) && !hasOwBit(g) && !hasProgressBit(g)) {
        errors.push(`${check.kind} needs roomId+chestIndex, roomId+mask, owScreen+mask, or bufferIndex+mask`);
      }
      break;
    case 'npc':
      if (g.bufferIndex === undefined && g.flagType === undefined && g.flagMask === undefined && g.roomFlag === undefined) {
        errors.push('npc needs bufferIndex, flagType/flagMask, or roomFlag');
      }
      break;
    case 'event':
      if (g.bufferIndex === undefined) errors.push('event needs bufferIndex');
      break;
    case 'potItem':
      if (!hasRoomBit(g)) errors.push('potItem needs roomId plus mask or chestIndex');
      break;
    case 'prize':
      break;
  }
  if (check.kind !== 'prize' && check.kind !== 'event' && isEmptyGameId(g)) {
    errors.push('gameId is entirely empty');
  }
  return errors;
};

const checkShapes = ({ checks }: InvariantInput): InvariantFinding[] =>
  checks.flatMap((check) => shapeErrors(check).map((detail) => finding(check.id, detail)));

export { checkShapes };
