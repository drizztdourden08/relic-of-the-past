/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';

const PathControlsLegend = () => {
  return (
    <Box style={{
      background: 'var(--c-glass)', border: '1px solid var(--c-hairline)',
      borderRadius: 'var(--r-sm)', padding: '4px 8px',
      boxShadow: 'var(--shadow-1)',
      fontFamily: 'monospace', fontSize: 10, lineHeight: '15px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <Text style={{ color: 'var(--c-gold-bright)', fontWeight: 700 }}>Path Debug Controls</Text>
      <Text style={{ color: 'var(--c-text-dim)' }}>LMB hold: live A* path to cursor</Text>
      <Text style={{ color: 'var(--c-text-dim)' }}>RMB while holding: lock target</Text>
      <Text style={{ color: 'var(--c-text-dim)' }}>Release LMB: clear lock/path</Text>
      <Text style={{ color: 'var(--c-gold)' }}>Shift+drag: select tiles → clipboard</Text>
    </Box>
  );
};

export { PathControlsLegend };
