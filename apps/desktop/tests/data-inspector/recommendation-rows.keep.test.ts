/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { openRecommendations, recommendationRows } from '@app/data-inspector/recommendations/recommendation-rows';
import { recommendationSource } from '@app/data-inspector/recommendations/recommendation-source';
import { buildSchema, createSchemaIndex } from '@drizztdourden08/tessera/data';
import type { Recommendation } from '@rotp/navigation';
import { required } from '@rotp/asset-extraction/testing';

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

describe('recommendationRows builds one flat, kind-agnostic table', { tags: ['critical'] }, () => {
  it('carries exactly the columns every finding can answer, whatever its collection', () => {
    const row = required(recommendationRows([entry()])[0], 'the one row');
    expect(Object.keys(row).sort()).toEqual(
      ['action', 'confidence', 'firstSeenAt', 'id', 'kind', 'reason', 'screenId', 'targetId'],
    );
  });


  it('keeps a create\'s missing target/screen as null, not a placeholder string', () => {
    const row = required(
      recommendationRows([entry({ action: 'create', targetId: null, screenId: null })])[0],
      'the create row',
    );
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

describe('recommendationRows keeps the pass order by default', { tags: ['critical'] }, () => {
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

});

describe('recommendationRows returns only what is still open', { tags: ['critical'] }, () => {
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

describe('the pseudo-collection source', { tags: ['critical'] }, () => {


  it('identifies a row by the finding id, and declares no write path', () => {
    const source = recommendationSource([entry({ id: 'r-42' })]);
    expect(source.getId(required(source.rows[0], 'the r-42 row'))).toBe('r-42');
    expect(source.onSave).toBeUndefined();
    expect(source.serialize).toBeUndefined();
  });
});
