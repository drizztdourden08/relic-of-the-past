/* @layer shared-game @kind logic */
import type { InvariantFinding, InvariantInput } from './invariant.type';

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

export { checkSourceFuncs };
