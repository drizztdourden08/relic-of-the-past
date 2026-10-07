/* @layer renderer-components @kind logic */
/**
 * The catalogue as the tab lists it: the kind pages filter by kind, the search field matches
 * the name, the one-line summary and the author, and each card knows what the app has of it.
 * Search runs here, on the whole list, the way the store site does it.
 */
import type { InstalledPack } from '@shared/store/installed-types';
import type { ItemCardView } from '@shared/store/home-types';
import type { StoreKind } from '@shared/store/types';
import type { StoreItemStatus } from '../../../compounds/StoreItemCard';
import type { InstalledRow } from '../Store.type';

const matchesQuery = (item: ItemCardView, needle: string): boolean =>
  item.name.toLowerCase().includes(needle)
  || item.summary.toLowerCase().includes(needle)
  || item.author.displayName.toLowerCase().includes(needle);

const filterItems = (items: ItemCardView[], kind: StoreKind | null, query: string): ItemCardView[] => {
  const needle = query.trim().toLowerCase();
  return items.filter((item) => (kind === null || item.kind === kind) && (!needle || matchesQuery(item, needle)));
};

const hasUpdate = (pack: InstalledPack, item: ItemCardView | null): boolean =>
  !!item && item.semver !== null && item.semver !== pack.semver;

const statusOf = (packs: InstalledPack[], item: ItemCardView): StoreItemStatus => {
  const pack = packs.find((p) => p.itemId === item.id);
  if (!pack) return null;
  return hasUpdate(pack, item) ? 'update' : 'installed';
};

/** Every installed pack with its card; newest install first. */
const installedRows = (packs: InstalledPack[], items: ItemCardView[]): InstalledRow[] =>
  [...packs]
    .sort((a, b) => b.installedAt - a.installedAt)
    .map((pack) => {
      const item = items.find((i) => i.id === pack.itemId) ?? null;
      return { pack, item, hasUpdate: hasUpdate(pack, item) };
    });

export { filterItems, statusOf, installedRows };
