/* @layer shared-game @kind logic */
import {
  HIGHLIGHT_END, HIGHLIGHT_KIND, HIGHLIGHT_PRIMARY, HIGHLIGHT_SECONDARY,
} from './highlight-markup.constants';

const openingFor = (open: number): string => {
  if (open === 1) return HIGHLIGHT_PRIMARY;
  return open === 2 ? HIGHLIGHT_SECONDARY : '';
};

const balanceRows = (rows: readonly string[]): string[] => {
  let open = 0;
  return rows.map((row) => {
    const opening = openingFor(open);
    for (const ch of row) open = HIGHLIGHT_KIND.get(ch) ?? open;
    return `${opening}${row}${open === 0 ? '' : HIGHLIGHT_END}`;
  });
};

export { balanceRows };
