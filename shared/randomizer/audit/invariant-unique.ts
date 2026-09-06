/* @layer shared-game @kind logic */
/**
 * A2-unique — no two checks may claim the same physical save bit. A room bit
 * is keyed by roomId plus its chest index or mask; an overworld bit by its
 * screen plus mask; a roomFlag occupies a chest bit like a chest does.
 *
 * One sharing is legitimate: a boss check and its prize check read the same
 * room 0x800 bit, because the prize is granted by the boss kill itself.
 */
import type { CheckRecord } from '../../game/data/types';
import type { InvariantFinding, InvariantInput } from './invariant-types';

const RULE = 'A2-unique';
const BOSS_KILL_MASK = 2048;

/** A same-room 0x800-bit pair where one side is the boss and the other its prize. */
const isBossPrizePair = (a: CheckRecord, b: CheckRecord): boolean =>
  a.gameId.mask === BOSS_KILL_MASK &&
  b.gameId.mask === BOSS_KILL_MASK &&
  ((a.kind === 'boss' && b.kind === 'prize') || (a.kind === 'prize' && b.kind === 'boss'));

/** All physical bit keys a single check occupies (usually zero or one). */
const bitKeysOf = (check: CheckRecord): string[] => {
  const g = check.gameId;
  const keys: string[] = [];
  if (g.roomId !== undefined) {
    if (g.chestIndex !== undefined) keys.push(`${g.roomId}:c${g.chestIndex}`);
    else if (g.mask !== undefined) keys.push(`${g.roomId}:m${g.mask}`);
  }
  if (g.roomFlag !== undefined) keys.push(`${g.roomFlag.roomId}:c${g.roomFlag.chestIndex}`);
  if (g.owScreen !== undefined && g.mask !== undefined) keys.push(`ow${g.owScreen}:m${g.mask}`);
  return keys;
};

const checkUniqueBits = ({ checks }: InvariantInput): InvariantFinding[] => {
  const owners = new Map<string, CheckRecord>();
  const findings: InvariantFinding[] = [];
  for (const check of checks) {
    for (const key of bitKeysOf(check)) {
      const owner = owners.get(key);
      if (owner === undefined) {
        owners.set(key, check);
        continue;
      }
      if (isBossPrizePair(owner, check)) continue;
      findings.push({
        rule: RULE, checkId: check.id, field: 'gameId',
        detail: `physical bit ${key} already claimed by ${owner.id} (also claimed by ${check.id})`,
      });
    }
  }
  return findings;
};

export { checkUniqueBits };
