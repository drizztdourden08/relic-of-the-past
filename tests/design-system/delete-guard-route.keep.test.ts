/* @layer tests @kind test */
/**
 * The delete-guard's rule, pulled out of `useDeleteGuard` as a pure function:
 * a referenced record stops at confirmation, an unreferenced one deletes
 * immediately with no dialog.
 */
import { describe, it, expect } from 'vitest';
import { all, ITEM_GROUP_IDS } from '@shared/game/data';
import { referencesTo } from '../../shared/game/data/relationships/reference-index';
import { routeDelete } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/useDeleteGuard';
import { recordDeleterFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/delete-record';
import { isReferenceGuarded, referencedByHitsFor } from '../../apps/web/src/ui/domains/app/views/DataInspector/behavior/reference-usage';
import type { ReferencedByHit } from '../../apps/web/src/ui/design-system/composites/RecordEditor';
import { describeDataset } from '../dataset-guard';

describeDataset('routeDelete carries the guard\'s whole rule', () => {
  it('deletes immediately when nothing references the record', () => {
    expect(routeDelete([])).toEqual({ kind: 'immediate' });
  });

  it('requires confirmation the moment anything references the record', () => {
    const hits: readonly ReferencedByHit[] = [
      { kind: 'screen', id: 'screen-001', field: 'tags', label: 'A Screen' },
    ];
    expect(routeDelete(hits)).toEqual({ kind: 'confirm', hits });
  });

  it('still requires confirmation for more than one reference', () => {
    const hits: readonly ReferencedByHit[] = [
      { kind: 'screen', id: 'screen-001', field: 'tags', label: 'A Screen' },
      { kind: 'check', id: 'check-072', field: 'requirements', label: 'A Check' },
    ];
    const route = routeDelete(hits);
    expect(route.kind).toBe('confirm');
    expect(route.kind === 'confirm' && route.hits).toHaveLength(2);
  });
});

describeDataset('routeDelete against the real dataset', () => {
  it('confirms before deleting a tag that is actually carried by a real screen', () => {
    const tagged = all('screen').find(screen => screen.tags.length > 0);
    expect(tagged).toBeDefined();
    const tagId = tagged!.tags[0];
    const hits = referencesTo('tag', tagId);
    expect(hits.length).toBeGreaterThan(0);
    expect(routeDelete(hits).kind).toBe('confirm');
  });

  it('deletes an item group nothing currently references with no confirmation', () => {
    // Swords is a real, seeded group with no static Requirement pointing at it today
    // (pinned by reference-index.test.ts). This is the guard's "no friction" path for real data.
    const hits = referencesTo('item-group', ITEM_GROUP_IDS.Swords);
    expect(hits).toEqual([]);
    expect(routeDelete(hits)).toEqual({ kind: 'immediate' });
  });
});

describeDataset('isReferenceGuarded / referencedByHitsFor', () => {
  it('answers for tag and item group only', () => {
    expect(isReferenceGuarded('tag')).toBe(true);
    expect(isReferenceGuarded('item-group')).toBe(true);
    expect(isReferenceGuarded('screen')).toBe(false);
  });

  it('returns nothing for a collection the reference index does not cover', () => {
    expect(referencedByHitsFor('screen', 'screen-001')).toEqual([]);
  });

  it('resolves each hit to a real display label, not the bare id', () => {
    const tagged = all('screen').find(screen => screen.tags.length > 0)!;
    const tagId = tagged.tags[0];
    const hits = referencedByHitsFor('tag', tagId);
    expect(hits.length).toBeGreaterThan(0);
    for (const hit of hits) {
      expect(hit.label.length).toBeGreaterThan(0);
    }
  });
});

describeDataset('recordDeleterFor', () => {
  it('has a real deleter for tag and for item group', () => {
    expect(recordDeleterFor('tag')).toBeDefined();
    expect(recordDeleterFor('item-group')).toBeDefined();
  });

  it('has no deleter at all for a kind with no delete write path', () => {
    expect(recordDeleterFor('screen')).toBeUndefined();
    expect(recordDeleterFor('enumeration')).toBeUndefined();
  });
});
