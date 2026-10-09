/* @layer shared-game @kind logic */
import { BOSS_KILL_MASK, UNIQUE_RULE } from './invariant.constants';
import type { CheckRecord } from '../../game/data/types';
import type { InvariantFinding, InvariantInput } from './invariant.type';

const isBossPrizePair = (a: CheckRecord, b: CheckRecord): boolean =>
  a.gameId.mask === BOSS_KILL_MASK &&
  b.gameId.mask === BOSS_KILL_MASK &&
  ((a.kind === 'boss' && b.kind === 'prize') || (a.kind === 'prize' && b.kind === 'boss'));

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
        rule: UNIQUE_RULE, checkId: check.id, field: 'gameId',
        detail: `physical bit ${key} already claimed by ${owner.id} (also claimed by ${check.id})`,
      });
    }
  }
  return findings;
};

export { checkUniqueBits };
