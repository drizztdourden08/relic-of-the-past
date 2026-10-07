/* @layer store-site @kind hook */
/**
 * The live version's pack for the Contents tab, read in parts over a signed link. The link
 * is fetched only once the tab has been opened, since each one counts toward the player's
 * daily preview cap, and then kept while the live version stays the same.
 */
import { useMemo } from 'react';
import type { StoreItem } from '@shared/store/types';
import { itemPack } from '../../../api/catalog-endpoints';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { usePackLink } from '../../../lib/pack-link/usePackLink';
import type { PackLink } from '../../../lib/pack-link/usePackLink';

type LivePack = {
  pack: PackLink;
  /** Why there is nothing to read, when there is nothing. */
  noPack: string | null;
};

const NO_LIVE = 'No approved version yet, so there is nothing to show.';

const noPackOf = (item: StoreItem): string | null => {
  const live = liveVersionOf(item);
  if (!live) return NO_LIVE;
  if (live.removed) return `The file of ${live.semver} was removed, so there is nothing to show.`;
  return null;
};

const useLivePack = (item: StoreItem | null, opened: boolean): LivePack => {
  const noPack = item ? noPackOf(item) : null;
  const id = item?.id ?? null;
  const liveN = item?.liveVersion ?? null;
  const readable = opened && id !== null && noPack === null;
  // liveN is a dependency so a new live version fetches a new link.
  const load = useMemo(() => (readable && id !== null && liveN !== null ? () => itemPack(id) : null), [readable, id, liveN]);
  const pack = usePackLink(load);
  return { pack, noPack };
};

export { useLivePack };
export type { LivePack };
