/* @layer renderer-app @kind logic */
/**
 * The comparison view's own state: which finding is open, what its proposal has
 * been edited to, and what the three verdicts do.
 *
 * The edited proposal lives HERE and nowhere else until an accept succeeds.
 * That is what makes Revert cheap and total — it drops a local value, it does
 * not undo anything — and it is why the store never sees a half-reviewed
 * proposal: what a detector suggested stays exactly as it was recorded until
 * somebody applies it, so re-running detection still reconciles onto the same
 * entry rather than colliding with a reviewer's draft.
 *
 * Every decision advances to the next open finding rather than closing the
 * panel. Working through a pass is the whole point of the screen, and landing
 * on an empty pane after each verdict would make it a screen you leave.
 */
import { useCallback, useMemo, useState } from 'react';
import { acceptAllCertain } from './accept-all-certain';
import { acceptRecommendation, dismissRecommendation } from './accept-recommendation';
import { NO_DRAFT, editedDraft, isAmended, proposalOf, revertedDraft } from './proposal-draft';
import { openInPassOrder } from './use-recommendations';
import type { BatchResult } from './accept-all-certain';
import type { Recommendation } from '@shared/game/recommendations';
import type { ProposalDraft } from './proposal-draft';
import type { InspectorRow } from '../../DataInspector.type';

interface ReviewParams {
  entries: readonly Recommendation[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const plural = (count: number): string => `${count} finding${count === 1 ? '' : 's'}`;

/** A batch reports its two leftovers separately: what refused to be written,
 *  and what nobody attempted because the proposal is still incomplete. */
const batchMessage = (result: BatchResult): string | null => {
  const parts: string[] = [];
  if (result.failures.length > 0) parts.push(`${plural(result.failures.length)} could not be written`);
  if (result.skipped.length > 0) parts.push(`${plural(result.skipped.length)} need more detail first`);
  return parts.length > 0 ? `${parts.join(', and ')} — they are still open.` : null;
};

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
    // Both refusals hold position: the entry stays selected, so the editor pane
    // beside this message is already where an incomplete proposal is finished.
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

  /** Every certain finding currently listed, one at a time — see accept-all-certain.ts. */
  const acceptAll = useCallback(async () => {
    setBusy(true);
    setError(null);
    const result = await acceptAllCertain(
      order,
      entry => acceptRecommendation(entry, entry.proposed as InspectorRow),
    );
    setBusy(false);
    setError(batchMessage(result));
    // Lands on the first thing the batch did not write, which is the only part
    // of the run still needing a person.
    settle(result.failures[0]?.id ?? result.skipped[0]?.id ?? null);
  }, [order, settle]);

  return { order, selected, proposed, setProposed, isEdited, revert, accept, dismiss, acceptAll, busy, error };
};

export { neighbourOf, useRecommendationReview };
export type { ReviewParams };
