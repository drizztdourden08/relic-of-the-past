/* @layer bridge-wasm @kind logic */
import type { ScreenAnnotation } from '../../simulation';
import { CHECK_KINDS } from './tally-checks.constants';

const tallyChecks = (items: readonly ScreenAnnotation[]) =>
  items.reduce(
    (acc, a) => {
      if (!CHECK_KINDS.has(a.kind)) return acc;
      if (a.state === 'done') acc.done += 1;
      else if (a.state === 'blocked') acc.blocked += 1;
      else acc.available += 1;
      return acc;
    },
    { done: 0, available: 0, blocked: 0 },
  );

export { tallyChecks };
