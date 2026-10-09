/* @layer renderer-components @kind logic */
import { OTHERWISE } from './case-match.constants';
import { winnerIn } from './winner-in';
import type { HudSwitchCase } from '@rotp/hud';
import type { CaseMatches, Scope } from './case-match.type';

const caseMatches = (cases: readonly HudSwitchCase[], scopes: readonly Scope[]): CaseMatches => {
  const wins = cases.map(() => 0);
  let otherwise = 0;
  scopes.forEach((scope) => {
    const at = winnerIn(cases, scope);
    if (at === OTHERWISE) otherwise += 1;
    else wins[at] += 1;
  });
  return { wins, otherwise, total: scopes.length };
};

export { caseMatches };
