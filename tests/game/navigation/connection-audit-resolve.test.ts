/* @layer tests @kind test */
import { describe, it, expect } from 'vitest';
import { inferTagsForDetected } from '../../../apps/web/src/ui/domains/widgets/navigation/connection-audit-resolve';
import type { DetectedConnection } from '../../../apps/web/src/ui/domains/widgets/navigation/useDatasetStatus';

const detOf = (type: DetectedConnection['type']): DetectedConnection => ({
  type,
  targetRoomOrScreen: 0x55,
  label: 'test',
});

describe('inferTagsForDetected — tag inference for a detected-but-unmapped transition', () => {
  it('tags an entrance as a two-way door into the destination', () => {
    expect(inferTagsForDetected(detOf('entrance'))).toEqual(['transit:door', 'dir:two-way', 'ctx:entrance']);
  });

  it('tags a stair as two-way internal stairs', () => {
    expect(inferTagsForDetected(detOf('stair'))).toEqual(['transit:stairs', 'dir:two-way', 'ctx:internal']);
  });

  it('tags a fall hole as a one-way entrance drop', () => {
    expect(inferTagsForDetected(detOf('hole'))).toEqual(['transit:hole', 'dir:one-way', 'ctx:entrance']);
  });

  it('falls back to a two-way overworld walk edge for any other kind', () => {
    expect(inferTagsForDetected(detOf('edge'))).toEqual(['transit:walk', 'dir:two-way', 'ctx:overworld']);
  });
});
