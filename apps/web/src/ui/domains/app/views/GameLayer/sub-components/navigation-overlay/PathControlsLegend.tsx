/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';

const S: Record<string, CSSProperties> = {
  panel: {
    background: 'var(--c-glass)', border: '1px solid var(--c-hairline)',
    borderRadius: 'var(--r-sm)', padding: '4px 8px',
    boxShadow: 'var(--shadow-1)',
    fontFamily: 'monospace', fontSize: 10, lineHeight: '15px',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  title: { color: 'var(--c-gold-bright)', fontWeight: 700 },
  dim: { color: 'var(--c-text-dim)' },
  gold: { color: 'var(--c-gold)' },
};

const PathControlsLegend = () => {
  return (
    <Box style={S.panel}>
      <Text style={S.title}>Path Debug Controls</Text>
      <Text style={S.dim}>LMB hold: live A* path to cursor</Text>
      <Text style={S.dim}>RMB while holding: lock target</Text>
      <Text style={S.dim}>Release LMB: clear lock/path</Text>
      <Text style={S.gold}>Shift+drag: select tiles → clipboard</Text>
    </Box>
  );
};

export { PathControlsLegend };
