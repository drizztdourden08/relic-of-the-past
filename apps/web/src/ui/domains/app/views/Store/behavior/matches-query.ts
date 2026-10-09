/* @layer renderer-components @kind logic */
import type { ItemCardView } from '@shared/store/home-types';

const matchesQuery = (item: ItemCardView, needle: string): boolean =>
  item.name.toLowerCase().includes(needle)
  || item.summary.toLowerCase().includes(needle)
  || item.author.displayName.toLowerCase().includes(needle);

export { matchesQuery };
