/* @layer renderer-app @kind hook */
import { useCallback, useMemo, useState } from 'react';
import type { InspectorRow } from '../../DataInspector.type';
import { acceptAllCertain } from './accept-all-certain';
import { acceptRecommendation, dismissRecommendation } from './accept-recommendation';
import { batchMessage } from './batch-message';
import { neighbourOf } from './neighbour-of';
import { NO_DRAFT, editedDraft, isAmended, proposalOf, revertedDraft } from './proposal-draft';
import type { ProposalDraft, ReviewParams } from './recommendations.type';
import { openInPassOrder } from './use-recommendations';

const useRecommendationReview = (params: ReviewParams) => {
  const { entries, selectedId, onSelect } = params;
  const [draft, setDraft] = useState<ProposalDraft>(NO_DRAFT);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const order = useMemo(() => openInPassOrder(entries), [entries]);
  const selected = useMemo(
    () => order.find(entry => entry.id === selectedId) ?? null,
    [order, selectedId],
  );

  const proposed = proposalOf(selected, draft);

  const setProposed = useCallback((next: InspectorRow) => {
    if (!selected) return;
    setDraft(editedDraft(selected, next));
  }, [selected]);

  const revert = useCallback(() => {
    setDraft(revertedDraft());
    setError(null);
  }, []);

  const isEdited = isAmended(selected, draft);

  const settle = useCallback((next: string | null) => {
    setDraft(revertedDraft());
    onSelect(next);
  }, [onSelect]);

  const accept = useCallback(async () => {
    if (!selected || !proposed) return;
    const next = neighbourOf(order, selected.id);
    setBusy(true);
    setError(null);
    const outcome = await acceptRecommendation(selected, proposed);
    setBusy(false);
    if (!outcome.success) { setError(outcome.error); return; }
    settle(next);
  }, [selected, proposed, order, settle]);

  const dismiss = useCallback(async () => {
    if (!selected) return;
    const next = neighbourOf(order, selected.id);
    setBusy(true);
    setError(null);
    await dismissRecommendation(selected);
    setBusy(false);
    settle(next);
  }, [selected, order, settle]);

  const acceptAll = useCallback(async () => {
    setBusy(true);
    setError(null);
    const result = await acceptAllCertain(
      order,
      entry => acceptRecommendation(entry, entry.proposed as InspectorRow),
    );
    setBusy(false);
    setError(batchMessage(result));
    settle(result.failures[0]?.id ?? result.skipped[0]?.id ?? null);
  }, [order, settle]);

  return { order, selected, proposed, setProposed, isEdited, revert, accept, dismiss, acceptAll, busy, error };
};

export { useRecommendationReview };
