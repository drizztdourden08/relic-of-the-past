/* @layer store-site @kind hook */
/**
 * All of the review page's state: the entry, the item as it will read once approved, the
 * header tab, the pack it reads and the link to it, and the reviewer's actions. A decision
 * or a delete goes back to the Reviewer Hub list.
 */
import { useCallback, useMemo, useState } from 'react';
import { navigate } from '@site-kit/router/useLocation';
import { useReviewActions } from '../../Review/behavior/useReviewActions';
import { packTargetOf } from './pack-target';
import { previewOf } from './preview-item';
import { usePackLink } from './usePackLink';
import { useReviewEntry } from './useReviewEntry';

type ReviewItemTab = 'store' | 'contents' | 'details';

const REVIEW_PATH = '/review';

const NO_TARGET = { n: null, noPack: null, note: null };

const useReviewItemPage = (rowId: string) => {
  const { entry, loading, error } = useReviewEntry(rowId);
  const [tab, setTab] = useState<ReviewItemTab>('store');
  const preview = useMemo(() => (entry ? previewOf(entry) : null), [entry]);
  const target = useMemo(() => (entry ? packTargetOf(entry) : NO_TARGET), [entry]);
  const pack = usePackLink(entry?.item.id ?? '', target.n);

  const backToList = useCallback(() => navigate(REVIEW_PATH), []);
  const actions = useReviewActions({ onSettled: backToList });

  const facts = preview?.version?.facts;
  const tabs = useMemo(() => ({
    items: [
      { id: 'store', label: 'Store page' },
      { id: 'contents', label: 'Contents', badge: facts?.kind === 'music' ? facts.trackCount : undefined },
      { id: 'details', label: 'Details' },
    ],
    activeId: tab,
    onSelect: (next: string) => setTab(next as ReviewItemTab),
  }), [tab, facts]);

  return { entry, loading, error, preview, target, pack, tab, tabs, actions, listPath: REVIEW_PATH };
};

export { useReviewItemPage };
export type { ReviewItemTab };
