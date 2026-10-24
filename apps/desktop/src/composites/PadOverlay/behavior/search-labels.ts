/* @layer renderer-components @kind logic */
import { SEARCH_BRANCH, SEARCH_BUDGET } from '../PadOverlay.constants';
import { optionsCompatible } from './options-compatible';
import type { Budget, Choice, Domains, LabelOption } from './placement.type';

const tightest = (domains: Domains): number => {
  let best = -1;
  domains.forEach((domain, index) => {
    if (domain && (best < 0 || domain.length < (domains[best]?.length ?? Infinity))) best = index;
  });
  return best;
};

const narrowed = (domains: Domains, index: number, option: LabelOption): Domains | null => {
  const next: (readonly LabelOption[] | null)[] = [];
  for (const [at, domain] of domains.entries()) {
    if (at === index || !domain) {
      next.push(null);
      continue;
    }
    const kept = domain.filter((other) => optionsCompatible(option, other));
    if (kept.length === 0) return null;
    next.push(kept);
  }
  return next;
};

const descend = (domains: Domains, chosen: Choice[], budget: Budget): boolean => {
  const index = tightest(domains);
  if (index < 0) return true;
  for (const option of (domains[index] ?? []).slice(0, SEARCH_BRANCH)) {
    if (budget.left <= 0) return false;
    budget.left -= 1;
    const next = narrowed(domains, index, option);
    if (!next) continue;
    chosen[index] = option;
    if (descend(next, chosen, budget)) return true;
    chosen[index] = null;
  }
  return false;
};

const searchLabels = (options: readonly LabelOption[][]): Choice[] | null => {
  if (options.some((domain) => domain.length === 0)) return null;
  const chosen: Choice[] = options.map(() => null);
  return descend(options, chosen, { left: SEARCH_BUDGET }) ? chosen : null;
};

export { searchLabels };
