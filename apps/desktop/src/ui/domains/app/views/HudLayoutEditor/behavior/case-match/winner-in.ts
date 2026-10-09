/* @layer renderer-components @kind logic */
import { gateTruthy } from '@shared/hud/engine';
import { OTHERWISE } from './case-match.constants';
import type { HudSwitchCase } from '@shared/types/hud';
import type { Scope } from './case-match.type';

const winnerIn = (cases: readonly HudSwitchCase[], scope: Scope): number => {
  const at = cases.findIndex((c) => gateTruthy(c.when, scope));
  return at === -1 ? OTHERWISE : at;
};

export { winnerIn };
