/* @layer shared-game @kind logic */
import { NO_DUNGEON_SCOPE } from './invariant.constants';
import type { InvariantFinding, InvariantInput } from './invariant.type';

const isBlank = (name: string | undefined): boolean => name === undefined || name.trim() === '';

const checkNames = ({ checks }: InvariantInput): InvariantFinding[] => {
  const findings: InvariantFinding[] = [];
  const byScopedName = new Map<string, string>();

  for (const check of checks) {
    if (isBlank(check.name)) {
      findings.push({
        rule: 'A6-name', checkId: check.id, field: 'name',
        detail: 'name is empty',
      });
      continue;
    }
    const scopedName = `${check.dungeonId ?? NO_DUNGEON_SCOPE}|${check.name}`;
    const owner = byScopedName.get(scopedName);
    if (owner === undefined) {
      byScopedName.set(scopedName, check.id);
      continue;
    }
    findings.push({
      rule: 'A6-name', checkId: check.id, field: 'name',
      detail: `name collides with ${owner} within scope ${check.dungeonId ?? NO_DUNGEON_SCOPE}`,
    });
  }
  return findings;
};

export { checkNames };
