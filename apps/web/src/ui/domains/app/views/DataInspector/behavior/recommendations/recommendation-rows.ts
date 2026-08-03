/* @layer renderer-app @kind logic */
/**
 * The pseudo-collection's rows: every OPEN finding, from every collection, as
 * one flat table.
 *
 * The columns are kind-agnostic on purpose. A findings list mixes screens,
 * connections and items in the same table, so a column only earns its place if
 * every row can answer it — anything a screen has and an item does not would be
 * a column that is blank for most of the list and misleading for the rest.
 * Whatever is specific to one finding belongs in the comparison panes, which
 * show the whole record.
 *
 * Every value is rendered as text here rather than left as raw data: the schema
 * is derived from the rows, and a mixed-type column would infer as `unknown`
 * and lose its filters. The timestamp keeps a sortable spelling for the same
 * reason — the text order and the chronological order have to agree.
 *
 * `targetId`/`screenId` stay `null` for a `create` finding rather than a dash
 * placeholder — the schema deriver only infers a field as `idRef` when EVERY
 * sampled value matches the id pattern, and it samples the present (non-null)
 * values only. A literal `'—'` string is itself a sampled value that fails the
 * pattern, so one `create` sitting next to any targeted finding degraded the
 * whole column to plain text for every row — losing id-ref styling, the
 * name-instead-of-id substitution, and click-to-navigate even for rows that DO
 * have a real target. `null` is invisible to the sampler, so the column reads
 * `idRef` off whatever real ids are present; the field kit's own absent-value
 * rendering already shows the same dash, just downstream of inference instead
 * of poisoning it.
 */
import type { Confidence, Recommendation, RecommendationAction } from '@shared/game/recommendations';

/** `certain` before `likely` — the batch-accept gate, so it leads the list. */
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
  /** `YYYY-MM-DD HH:MM`, UTC — text order and chronological order agree. */
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

/**
 * Certain findings first, then oldest first within each — the order a review
 * pass wants to work through, and the table's default because nothing overrides
 * it until a header is clicked.
 */
const byConfidenceThenAge = (a: Recommendation, b: Recommendation): number =>
  CONFIDENCE_RANK[a.confidence] - CONFIDENCE_RANK[b.confidence] || a.firstSeenAt - b.firstSeenAt;

/** Only what is still open: a decided finding has left the pass. */
const openRecommendations = (entries: readonly Recommendation[]): readonly Recommendation[] =>
  entries.filter(entry => entry.state === 'open');

const recommendationRows = (entries: readonly Recommendation[]): readonly RecommendationRow[] =>
  [...openRecommendations(entries)].sort(byConfidenceThenAge).map(rowOf);

export { CONFIDENCE_RANK, byConfidenceThenAge, openRecommendations, recommendationRows };
export type { RecommendationRow };
