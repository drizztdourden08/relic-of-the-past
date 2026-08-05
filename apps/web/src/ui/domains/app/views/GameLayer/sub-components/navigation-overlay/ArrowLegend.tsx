/* @layer renderer-components @kind component */
/**
 * Traversal arrows — the moves the flood makes that are not a plain walk.
 *
 * Its own box rather than a section inside the dot legend: an arrow is a different
 * kind of mark from a dot (an edge between two tiles, not a property of one), and
 * splitting it keeps each panel short enough to collapse usefully.
 */
import type { CSSProperties } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { CollapsiblePanel } from './CollapsiblePanel';

const S: Record<string, CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', gap: 5 },
  dim: { color: 'var(--c-text-dim)' },
  cliff: { color: 'var(--c-danger)' },
  stairs: { color: 'var(--c-info)' },
};

const ArrowLegend = () => {
  return (
    <CollapsiblePanel title="arrows">
      <Box style={S.row}><Text style={S.cliff}>→</Text><Text style={S.dim}>cliff jump</Text></Box>
      <Box style={S.row}><Text style={S.stairs}>→</Text><Text style={S.dim}>stairs (bidirectional)</Text></Box>
    </CollapsiblePanel>
  );
};

export { ArrowLegend };
