/* @layer shared-game @kind logic */
import {
  HIGHLIGHT_END, HIGHLIGHT_KIND, HIGHLIGHT_PRIMARY, HIGHLIGHT_SECONDARY,
} from './highlight-markup.constants';

const balanceRows = (rows: readonly string[]): string[] => {
  let open = 0;
  return rows.map((row) => {
    const opening = open === 1 ? HIGHLIGHT_PRIMARY : open === 2 ? HIGHLIGHT_SECONDARY : '';
    for (const ch of row) open = HIGHLIGHT_KIND.get(ch) ?? open;
    return `${opening}${row}${open === 0 ? '' : HIGHLIGHT_END}`;
  });
};

export { balanceRows };
