/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { CheckDefinition } from '../../shared/game/types';
import type { ObservedCheck } from '../../shared/game/simulation/recording/recorder';
import { createRecorder, recordCheck } from '../../shared/game/simulation/recording/recorder';
import { buildDatasetSuggestions } from '../../shared/game/simulation/recording/dataset-updates';

// ─── recordCheck — dedup key includes location ───────────────────────────────
// Unmatched checks all share the generic 'unknown-check' name (check-matcher's
// UNKNOWN), so a name-only dedup key collapses every distinct unknown
// observation in a run down to the first one seen.

const unknownAt = (screenId: string, roomId: number, row: number, col: number): ObservedCheck => ({
  name: 'unknown-check',
  screenId,
  roomId,
  tile: { row, col },
});

describe('recordCheck — unknown-check collapse', () => {
  it('keeps two unknown checks observed in different rooms', () => {
    const rec = createRecorder();
    recordCheck(rec, unknownAt('A', 0x10, 0, 0));
    recordCheck(rec, unknownAt('B', 0x20, 1, 1));

    expect(rec.checks).toHaveLength(2);
  });

  it('still dedupes a true repeat of the same check at the same location', () => {
    const rec = createRecorder();
    recordCheck(rec, unknownAt('A', 0x10, 0, 0));
    recordCheck(rec, unknownAt('A', 0x10, 0, 0));

    expect(rec.checks).toHaveLength(1);
  });

  it('yields a dataset suggestion for each distinct unknown check', () => {
    const rec = createRecorder();
    recordCheck(rec, unknownAt('A', 0x10, 0, 0));
    recordCheck(rec, unknownAt('B', 0x20, 1, 1));

    const suggestions = buildDatasetSuggestions(rec, { connections: [], checks: [] as CheckDefinition[] });
    expect(suggestions.filter(s => s.kind === 'check')).toHaveLength(2);
  });
});
