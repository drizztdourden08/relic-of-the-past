/* @layer renderer-components @kind logic */
import type { InstalledPack } from '@shared/store/installed-types';
import type { ItemCardView } from '@shared/store/home-types';

const hasUpdate = (pack: InstalledPack, item: ItemCardView | null): boolean =>
  item !== null && item.semver !== null && item.semver !== pack.semver;

export { hasUpdate };
