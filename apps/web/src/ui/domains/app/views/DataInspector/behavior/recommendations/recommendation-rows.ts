/* @layer renderer-app @kind logic */
/**
 * Every open finding, from every collection, as one flat table. Columns are
 * kind-agnostic on purpose: anything only some rows can answer belongs in the
 * comparison panes. Every value is text, because a mixed-type column would
 * infer as `unknown` and lose its filters; the timestamp spelling sorts
 * chronologically for the same reason.
 *
 * `targetId`/`screenId` stay `null` for a `create`, never a dash placeholder:
 * the schema deriver samples present values only, and a literal dash fails the
 * id pattern, which degraded the whole column to plain text (no id-ref
 * styling, no name substitution, no click-to-navigate). The field kit renders
 * the dash for absent values downstream of inference.
 */
import type { Confidence, Recommendation, RecommendationAction } from '@shared/game/recommendations';

/** `certain` before `likely`: the batch-accept gate leads the list. */
const CONFIDENCE_RANK: Record<Confidence, number> = { certain: 0, likely: 1 };

interface RecommendationRow {
  /** The recommendation's own content-derived id, which is the row's identity. */
  id: string;
  kind: string;
  action: RecommendationAction;
  /** The record being changed; `null` for a `create`, which has no target yet. */
  targetId: string | null;
  reason: string;
  confidence: Confidence;
  screenId: string | null;
  /** `YYYY-MM-DD HH:MM` in UTC, so text order matches chronological order. */
  firstSeenAt: string;
}

const stampOf = (at: number): string => new Date(at).toISOString().slice(0, 16).replace('T', ' ');

const rowOf = (entry: Recommendation): RecommendationRow => ({
  id: entry.id,
  kind: entry.kind,
  action: entry.action,
  targetId: entry.targetId ?? null,
  reason: entry.reason,
  confidence: entry.confidence,
  screenId: entry.screenId ?? null,
  firstSeenAt: stampOf(entry.firstSeenAt),
});

/** Certain first, then oldest first: the order a review pass works through, and the table's default. */
const byConfidenceThenAge = (a: Recommendation, b: Recommendation): number =>
  CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence] || a.firstSeenAt - b.firstSeenAt;

/** Only what is still open: a decided finding has left the pass. */
const openRecommendations = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  entries.filter(entry => entry.state === 'open');

const recommendationRows = (entries: readonly Recommendation[]): readonly RecommendationRow[] =>
  [...openRecommendations(entries)].sort(byConfidenceThenAge).map(rowOf);

export { CONFIDENCE_RANK, byConfidenceThenAge, openRecommendations, recommendationRows };
export type { RecommendationRow };
