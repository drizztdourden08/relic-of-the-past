/* @layer renderer-components @kind logic */
import type { InstalledPack } from '@shared/store/installed-types';
import type { ItemCardView } from '@shared/store/home-types';
import type { InstalledRow } from '../Store.type';
import { hasUpdate } from './has-update';

const installedRows = (packs: InstalledPack[], items: ItemCardView[]): InstalledRow[] =>
  [...packs]
    .sort((a, b) => b.installedAt - a.installedAt)
    .map((pack) => {
      const item = items.find((i) => i.id === pack.itemId) ?? null;
      return { pack, item, hasUpdate: hasUpdate(pack, item) };
    });

export { installedRows };
