/* @layer shared-game @kind logic */
/**
 * A6-name: every check names itself for the randomizer, and no two checks
 * within the same dungeon scope (or both scope-less) share that name.
 *
 * SRC-func: a check citing a source function must point at text that really
 * exists in the core sprite source; only runs when that text is supplied.
 */
import type { InvariantFinding, InvariantInput } from './invariant-types';

const NO_SCOPE = '(no-dungeon)';

const checkNames = ({ checks }: InvariantInput): InvariantFinding[] => {
  const findings: InvariantFinding[] = [];
  const byScopedName = new Map<string, string>();

  for (const check of checks) {
    if (check.randomizerName === undefined || check.randomizerName.trim() === '') {
      findings.push({
        rule: 'A6-name', checkId: check.id, field: 'randomizerName',
        detail: 'randomizerName is empty',
      });
      continue;
    }
    const scopedName = `${check.dungeonId ?? NO_SCOPE}|${check.randomizerName}`;
    const owner = byScopedName.get(scopedName);
    if (owner === undefined) {
      byScopedName.set(scopedName, check.id);
      continue;
    }
    findings.push({
      rule: 'A6-name', checkId: check.id, field: 'randomizerName',
      detail: `name collides with ${owner} within scope ${check.dungeonId ?? NO_SCOPE}`,
    });
  }
  return findings;
};

const checkSourceFuncs = ({ checks, spriteMainText }: InvariantInput): InvariantFinding[] => {
  if (spriteMainText === undefined) return [];
  const findings: InvariantFinding[] = [];
  for (const check of checks) {
    if (check.sourceFunc === undefined) continue;
    if (!spriteMainText.includes(check.sourceFunc)) {
      findings.push({
        rule: 'SRC-func', checkId: check.id, field: 'sourceFunc',
        detail: `sourceFunc ${check.sourceFunc} not found in the core sprite source`,
      });
    }
  }
  return findings;
};

export { checkNames, checkSourceFuncs };
