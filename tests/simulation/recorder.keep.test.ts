/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { ObservedCheck } from '@rotp/navigation';
import { createRecorder, recordCheck } from '@rotp/navigation';
import { buildDatasetSuggestions } from '@rotp/navigation';

const unidentifiedAt = (screenId: string, roomId: number, row: number, col: number): ObservedCheck => ({
  checkId: null,
  screenId,
  roomId,
  tile: { row, col },
});

describe('recordCheck collapses an unidentified observation', () => {
  it('keeps two unidentified observations made in different rooms', () => {
    const rec = createRecorder();
    recordCheck(rec, unidentifiedAt('A', 0x10, 0, 0));
    recordCheck(rec, unidentifiedAt('B', 0x20, 1, 1));

    expect(rec.checks).toHaveLength(2);
  });

  it('still dedupes a true repeat of the same check at the same location', () => {
    const rec = createRecorder();
    recordCheck(rec, unidentifiedAt('A', 0x10, 0, 0));
    recordCheck(rec, unidentifiedAt('A', 0x10, 0, 0));

    expect(rec.checks).toHaveLength(1);
  });

  it('yields a dataset suggestion for each distinct unidentified observation', () => {
    const rec = createRecorder();
    recordCheck(rec, unidentifiedAt('A', 0x10, 0, 0));
    recordCheck(rec, unidentifiedAt('B', 0x20, 1, 1));

    const suggestions = buildDatasetSuggestions(rec, { connections: [] });
    expect(suggestions.filter(s => s.kind === 'check')).toHaveLength(2);
  });
});
