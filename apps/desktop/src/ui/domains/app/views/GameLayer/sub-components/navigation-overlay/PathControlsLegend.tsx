/* @layer renderer-components @kind component */
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';

const PathControlsLegend = () => {
  return (
    <Box style={{
      position: 'absolute', bottom: 90, right: 6, zIndex: 7,
      background: 'var(--c-glass)', border: '1px solid var(--c-info)',
      borderRadius: 'var(--r-sm)', padding: '4px 8px', pointerEvents: 'none',
      fontFamily: 'monospace', fontSize: 10, lineHeight: '15px',
      display: 'flex', flexDirection: 'column', gap: 2,
    }}>
      <Text style={{ color: 'var(--c-info)', fontWeight: 700 }}>Path Debug Controls</Text>
      <Text style={{ color: 'var(--c-text-dim)' }}>LMB hold: live A* path to cursor</Text>
      <Text style={{ color: 'var(--c-text-dim)' }}>RMB while holding: lock target</Text>
      <Text style={{ color: 'var(--c-text-dim)' }}>Release LMB: clear lock/path</Text>
      <Text style={{ color: 'var(--c-gold)' }}>Shift+drag: select tiles → clipboard</Text>
    </Box>
  );
};

export { PathControlsLegend };
