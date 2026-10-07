/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import type { ObservedCheck } from '../../shared/game/simulation/recording/recorder';
import { createRecorder, recordCheck } from '../../shared/game/simulation/recording/recorder';
import { buildDatasetSuggestions } from '../../shared/game/simulation/recording/dataset-updates';

// recordCheck: dedup key includes location. Unidentified observations carry a
// null checkId, so an identity-only key would collapse them to the first seen.

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
