/* @layer renderer-app @kind logic */
/**
 * The comparison view's state: which finding is open, its edited proposal, and
 * the three verdicts. The edited proposal lives only here until an accept
 * succeeds, so Revert drops a local value and the store never sees a
 * half-reviewed proposal. Every decision advances to the next open finding
 * instead of closing the panel.
 */
import { useCallback, useMemo, useState } from 'react';
import { acceptAllCertain } from './accept-all-certain';
import { acceptRecommendation, dismissRecommendation } from './accept-recommendation';
import { NO_DRAFT, editedDraft, isAmended, proposalOf, revertedDraft } from './proposal-draft';
import { openInPassOrder } from './use-recommendations';
import type { Recommendation } from '@shared/game/recommendations';
import type { ProposalDraft } from './proposal-draft';
import type { InspectorRow } from '../../DataInspector.type';

interface ReviewParams {
  entries: readonly Recommendation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const BATCH_FAILURES = (count: number): string =>
  `${count} finding${count === 1 ? '' : 's'} could not be written. They are still open.`;

/** The one after it in pass order, or the one before when it was last. */
const neighbourOf = (order: readonly Recommendation[], id: string): string | null => {
  const at = order.findIndex(entry => entry.id === id);
  if (at === -1) return null;
  return order[at + 1]?.id ?? order[at - 1]?.id ?? null;
};

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

  /** Discards the reviewer's amendments, restoring the detector's own draft. */
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
    if (!outcome.success) { setError(outcome.error ?? null); return; }
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

  /** Every certain finding currently listed, one at a time (see accept-all-certain.ts). */
  const acceptAll = useCallback(async () => {
    setBusy(true);
    setError(null);
    const result = await acceptAllCertain(
      order,
      entry => acceptRecommendation(entry, entry.proposed as InspectorRow),
    );
    setBusy(false);
    setError(result.failures.length ? BATCH_FAILURES(result.failures.length) : null);
    // Lands on the first finding the batch could not write.
    settle(result.failures[0]?.id ?? null);
  }, [order, settle]);

  return { order, selected, proposed, setProposed, isEdited, revert, accept, dismiss, acceptAll, busy, error };
};

export { neighbourOf, useRecommendationReview };
export type { ReviewParams };
