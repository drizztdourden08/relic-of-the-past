/* @layer store-site @kind hook */
import { useCallback, useMemo, useState } from 'react';
import { navigate } from '@rotp/design';
import { reviewPack } from '../../../endpoints/review-endpoints';
import { usePackLink } from '../../../lib/pack-link/usePackLink';
import { useReviewActions } from '../../Review/behavior/useReviewActions';
import { packTargetOf } from './pack-target';
import { previewOf } from './preview-item';
import { useReviewEntry } from './useReviewEntry';
import { NO_TARGET, REVIEW_PATH } from './useReviewItemPage.constants';
import type { ReviewItemTab } from './useReviewItemPage.type';

const useReviewItemPage = (rowId: string) => {
  const { entry, loading, error } = useReviewEntry(rowId);
  const [tab, setTab] = useState<ReviewItemTab>('store');
  const preview = useMemo(() => (entry ? previewOf(entry) : null), [entry]);
  const target = useMemo(() => (entry ? packTargetOf(entry) : NO_TARGET), [entry]);
  const itemId = entry?.item.id ?? null;
  const { n } = target;
  const load = useMemo(
    () => (itemId === null || n === null ? null : () => reviewPack(itemId, { kind: 'version', n })),
    [itemId, n],
  );
  const pack = usePackLink(load);

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
