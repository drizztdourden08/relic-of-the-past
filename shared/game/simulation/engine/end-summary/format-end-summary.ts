/* @layer shared-game @kind logic */
import type { EndSummary } from './end-summary.type';

const formatEndSummary = (s: EndSummary): string[] => [
  `screens  ${s.screens.discovered} discovered / ${s.screens.entered} entered / ${s.exits.leadingNowhereNew} never entered`,
  `targets  ${s.targets.found} found / ${s.targets.done} done / ${s.targets.failed} failed / ${s.targets.stillPending} still pending`,
  `checks   ${s.checks.verified} verified`,
  `keys     ${Object.entries(s.keys.held).map(([d, n]) => `${d}x${n}`).join(' ') || 'none'}${s.keys.bigKeys.length ? ` · big: ${s.keys.bigKeys.join(' ')}` : ''}`,
  `edges    ${s.exits.edges} in the discovered graph`,
];

export { formatEndSummary };
