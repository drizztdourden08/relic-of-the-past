/* @layer store-site @kind hook */
import { useMemo } from 'react';
import type { StoreItem } from '@rotp/hub-contracts';
import { itemPack } from '../../../endpoints/catalog-endpoints';
import { liveVersionOf } from '../../../catalog/approved-versions';
import { usePackLink } from '../../../pack-link/usePackLink';
import { NO_LIVE } from './useLivePack.constants';
import type { LivePack } from './useLivePack.type';

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
  const load = useMemo(() => (readable && id !== null && liveN !== null ? () => itemPack(id) : null), [readable, id, liveN]);
  const pack = usePackLink(load);
  return { pack, noPack };
};

export { useLivePack };
