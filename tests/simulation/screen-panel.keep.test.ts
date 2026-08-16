/* @layer tests @kind test */
/**
 * The widget's "On this screen" list must show everything the overlay draws, so
 * these tests pin the place that could silently swallow an item: the grouping —
 * an unmapped kind must land in "Unmapped" rather than vanish.
 */
import { describe, it, expect } from 'vitest';
import type { ScreenAnnotation } from '../../shared/game/simulation';
import { roomTagName } from '../../shared/game/simulation';
import { groupAnnotations } from '../../apps/web/src/ui/domains/widgets/navigation/sub-components/ScreenPanel/annotation-rows';
import { describeDataset } from '../dataset-guard';

const at = (kind: ScreenAnnotation['kind'], label: string, extra: Partial<ScreenAnnotation> = {}): ScreenAnnotation =>
  ({ kind, label, tile: { row: 0, col: 0 }, ...extra });

describeDataset('annotation grouping', () => {
  it('keeps every item, including unmapped kinds', () => {
    const items = [
      at('chest', 'Map Chest'),
      at('cell-lock', 'cell lock #0'),
      at('big-key-carrier', 'big key guard'),
      at('unknown', 'something new'),
    ];
    const groups = groupAnnotations(items);
    expect(groups.map((g) => g.id)).toEqual(['checks', 'locks', 'triggers', 'other']);
    expect(groups.flatMap((g) => g.items)).toHaveLength(items.length);
    expect(groups.find((g) => g.id === 'other')?.items[0].label).toBe('something new');
  });

  it('drops empty groups rather than rendering headers with nothing under them', () => {
    expect(groupAnnotations([at('chest', 'Map Chest')]).map((g) => g.id)).toEqual(['checks']);
    expect(groupAnnotations([])).toEqual([]);
  });
});

describeDataset('room tag names', () => {
  it('labels the whole clear-the-room family, not just one value', () => {
    for (const tag of [0x01, 0x0a, 0x13]) expect(roomTagName(tag)).toBe('clear enemies → doors open');
  });

  it('labels the known door/water/hole mechanics', () => {
    expect(roomTagName(0x14)).toBe('trigger → block door');
    expect(roomTagName(0x26)).toBe('kill room → block');
  });

  it('falls back to hex rather than claiming to know an unmapped tag', () => {
    expect(roomTagName(0x35)).toBe('tag 0x35');
  });
});
