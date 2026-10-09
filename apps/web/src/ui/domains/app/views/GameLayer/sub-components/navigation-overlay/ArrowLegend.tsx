/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box, Text } from '@drizztdourden08/tessera/primitives';
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
