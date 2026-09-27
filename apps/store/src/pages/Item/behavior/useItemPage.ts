/* @layer store-site @kind hook */
/**
 * All of the item page's state: the item as this player may see it, the header tab, the
 * approved versions, the player's rating, and a reviewer's unlist and relist.
 */
import { useCallback, useMemo, useState } from 'react';
import type { StoreItem } from '@shared/store/types';
import { hasRight } from '@shared/hub/rights';
import { useSessionContext } from '@site-kit/session/session-context';
import { useItem } from '../../../catalog/useItem';
import { approvedVersions } from '../../../catalog/approved-versions';
import { useListingToggle } from '../../../catalog/useListingToggle';
import { REVIEW_PERMISSION } from '../../../site/site-sections';
import { plural } from '../../../lib/format-count';
import { useRating } from './useRating';

type ItemTab = 'overview' | 'versions' | 'ratings';

const useItemPage = (id: string) => {
  const { me, rights } = useSessionContext();
  const { data, loading, error, merge } = useItem(id);
  const [tab, setTab] = useState<ItemTab>('overview');
  const versions = useMemo(() => (data ? approvedVersions(data.item) : []), [data]);
  const rating = useRating({ data, meId: me?.id ?? '', merge });

  const onItem = useCallback((item: StoreItem) => merge({ item }), [merge]);
  const listing = useListingToggle(onItem);

  const tabs = useMemo(() => ({
    items: [
      { id: 'overview', label: 'Overview' },
      { id: 'versions', label: 'Versions', badge: versions.length },
      { id: 'ratings', label: 'Ratings', badge: data?.item.stats.ratingCount ?? 0 },
    ],
    activeId: tab,
    onSelect: (next: string) => setTab(next as ItemTab),
  }), [tab, versions.length, data]);

  const installedNote = data?.installed ? 'You installed it, so you can change your stars any time.' : undefined;
  const ratingsLine = data ? plural(data.item.stats.ratingCount, 'rating', 'ratings') : '';

  return {
    data,
    loading,
    error,
    tab,
    tabs,
    versions,
    rating,
    installedNote,
    ratingsLine,
    canModerate: hasRight(rights, REVIEW_PERMISSION),
    listing,
  };
};

export { useItemPage };
export type { ItemTab };
