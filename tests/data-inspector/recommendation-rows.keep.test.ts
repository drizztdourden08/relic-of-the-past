/* @layer tests @kind test */
/**
 * The recommendations pseudo-collection's rows.
 *
 * Three properties matter and none of them is cosmetic. The columns are
 * KIND-AGNOSTIC — a findings list mixes collections, so a column only earns its
 * place if every row can answer it. The order is the order a review pass works
 * through: certain first (that being the batch-accept gate), oldest first
 * within each. And a decided finding is gone from the list, which is what makes
 * Reject "remove from view" without writing to the dataset.
 */
import { describe, it, expect } from 'vitest';
import {
  byConfidenceThenAge, openRecommendations, recommendationRows,
} from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-rows';
import {
  RECOMMENDATION_GROUP_BY, RECOMMENDATION_SCHEMA, recommendationSource,
} from '@app/ui/domains/app/views/DataInspector/behavior/recommendations/recommendation-source';
// Imported from its own module rather than the `@ds/data` barrel on purpose:
// the barrel pulls in the view-state binding, which touches `window` at
// module load.
import { buildSchema, createSchemaIndex } from '../../apps/web/src/ui/design-system/data/schema/build-schema';
import type { Recommendation } from '@shared/game/recommendations';

const entry = (over: Partial<Recommendation> = {}): Recommendation => ({
  id: 'r1',
  kind: 'connection',
  action: 'update',
  targetId: 'connection-001',
  current: null,
  proposed: { id: 'connection-001' },
  reason: 'the game exposes a crossing the dataset does not',
  detector: 'connection-add',
  evidence: [],
  confidence: 'likely',
  screenId: 'hc-0x80',
  origin: 'live',
  state: 'open',
  firstSeenAt: 1000,
  decidedAt: null,
  ...over,
} as Recommendation);

describe('recommendationRows — one flat, kind-agnostic table', () => {
  it('carries exactly the columns every finding can answer, whatever its collection', () => {
    const [row] = recommendationRows([entry()]);
    expect(Object.keys(row).sort()).toEqual(
      ['action', 'confidence', 'firstSeenAt', 'id', 'kind', 'reason', 'screenId', 'targetId'],
    );
  });

  it('offers no column that only some collections have', () => {
    const rows = recommendationRows([
      entry({ id: 'a', kind: 'screen', targetId: 'screen-001' }),
      entry({ id: 'b', kind: 'item', targetId: 'item-004' }),
    ]);
    // Every row declares the same keys — nothing leaks in from one record shape.
    expect(Object.keys(rows[0])).toEqual(Object.keys(rows[1]));
  });

  it('keeps a create\'s missing target/screen as null, not a placeholder string', () => {
    // A literal dash would be a sampled STRING value that fails the id pattern,
    // degrading the whole column to plain text the moment a create sits next to
    // any targeted finding — see the file header. null is invisible to the
    // sampler, so the column still infers idRef off whatever real ids exist.
    const [row] = recommendationRows([entry({ action: 'create', targetId: null, screenId: null })]);
    expect(row.targetId).toBeNull();
    expect(row.screenId).toBeNull();
  });

  it('still infers targetId/screenId as idRef when a create (no target) sits beside a targeted finding', () => {
    const rows = recommendationRows([
      entry({ id: 'new-conn', action: 'create', targetId: null, screenId: 'screen-142' }),
      entry({ id: 'fix-conn', action: 'update', targetId: 'connection-001', screenId: 'screen-088' }),
    ]);
    const schema = createSchemaIndex(buildSchema(rows));
    expect(schema.byPath('targetId')?.kind).toBe('idRef');
    expect(schema.byPath('screenId')?.kind).toBe('idRef');
  });

  it('spells the timestamp so its text order is its chronological order', () => {
    const rows = recommendationRows([
      entry({ id: 'late', firstSeenAt: Date.UTC(2026, 0, 2, 3, 4) }),
      entry({ id: 'early', firstSeenAt: Date.UTC(2025, 11, 31, 23, 59) }),
    ]);
    const stamps = rows.map(row => row.firstSeenAt);
    expect(stamps).toEqual(['2025-12-31 23:59', '2026-01-02 03:04']);
    expect([...stamps].sort()).toEqual(stamps);
  });
});

describe('recommendationRows — the default order is the pass order', () => {
  it('puts certain findings ahead of likely ones', () => {
    const rows = recommendationRows([
      entry({ id: 'maybe', confidence: 'likely', firstSeenAt: 1 }),
      entry({ id: 'sure', confidence: 'certain', firstSeenAt: 9 }),
    ]);
    expect(rows.map(row => row.id)).toEqual(['sure', 'maybe']);
  });

  it('breaks a tie by age, oldest first', () => {
    const rows = recommendationRows([
      entry({ id: 'newer', confidence: 'certain', firstSeenAt: 500 }),
      entry({ id: 'older', confidence: 'certain', firstSeenAt: 100 }),
    ]);
    expect(rows.map(row => row.id)).toEqual(['older', 'newer']);
  });

  it('sorts without mutating what it was handed', () => {
    const entries = [entry({ id: 'b', confidence: 'likely' }), entry({ id: 'a', confidence: 'certain' })];
    recommendationRows(entries);
    expect(entries.map(item => item.id)).toEqual(['b', 'a']);
  });

  it('exposes the same comparator the "next finding" step reuses', () => {
    const certain = entry({ confidence: 'certain', firstSeenAt: 10 });
    const likely = entry({ confidence: 'likely', firstSeenAt: 1 });
    expect(byConfidenceThenAge(certain, likely)).toBeLessThan(0);
  });
});

describe('recommendationRows — only what is still open', () => {
  it('drops accepted, dismissed and resolved findings', () => {
    const entries = [
      entry({ id: 'open', state: 'open' }),
      entry({ id: 'yes', state: 'accepted' }),
      entry({ id: 'no', state: 'dismissed' }),
      entry({ id: 'gone', state: 'resolved' }),
    ];
    expect(openRecommendations(entries).map(item => item.id)).toEqual(['open']);
    expect(recommendationRows(entries).map(row => row.id)).toEqual(['open']);
  });
});

describe('the pseudo-collection source', () => {
  it('opens grouped by which collection each finding is about', () => {
    expect(RECOMMENDATION_GROUP_BY).toEqual(['kind']);
  });

  it('shows the kind-agnostic columns in review order', () => {
    expect(RECOMMENDATION_SCHEMA.defaultColumns).toEqual([
      'kind', 'action', 'targetId', 'reason', 'confidence', 'screenId', 'firstSeenAt',
    ]);
  });

  it('identifies a row by the finding id, and declares no write path', () => {
    const source = recommendationSource([entry({ id: 'r-42' })]);
    expect(source.getId(source.rows[0])).toBe('r-42');
    // A finding is not a record: nothing here creates, emits or saves one.
    expect(source.onSave).toBeUndefined();
    expect(source.serialize).toBeUndefined();
  });
});
