/* @layer store-site @kind logic */
/** The catalogue items a search matches: every word must appear in the name, line, author or kind. */
import type { ItemCardView } from '@shared/store/home-types';

const haystackOf = (item: ItemCardView): string =>
  [item.name, item.summary, item.author.displayName, item.kind, item.slug].join(' ').toLowerCase();

const matchItems = (items: readonly ItemCardView[], query: string): ItemCardView[] => {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return items.filter((item) => {
    const haystack = haystackOf(item);
    return words.every((word) => haystack.includes(word));
  });
};

export { matchItems };
