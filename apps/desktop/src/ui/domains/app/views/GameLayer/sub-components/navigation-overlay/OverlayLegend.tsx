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
  row: { display: 'flex', alignItems: 'center', gap: 6 },
  dim: { color: 'var(--c-text-dim)' },
};

const OverlayLegend = () => {
  return (
    <Box style={S.panel}>
      <LegendItem color="var(--c-info)" label="reachable (free)" />
      <LegendItem color="var(--c-danger)" label="reachable (needs item)" />
      <LegendItem color="var(--c-danger)" label="cliff jump" isArrow />
      <LegendItem color="var(--c-info)" label="stairs (bidirectional)" isArrow />
      <LegendItem color="var(--c-info)" border="var(--c-green)" label="hookshot target" />
    </Box>
  );
};

const LegendItem = ({ color, label, border, isArrow }: { color: string; label: string; border?: string; isArrow?: boolean }) => {
  return (
    <Box style={S.row}>
      {isArrow ? (
        <Text style={{ color, fontSize: 12 }}>→</Text>
      ) : (
        <Box style={{
          width: 8, height: 8, borderRadius: '50%', background: color,
          border: border ? `2px solid ${border}` : 'none',
          boxSizing: 'border-box', flexShrink: 0,
        }} />
      )}
      <Text style={S.dim}>{label}</Text>
    </Box>
  );
};

export { OverlayLegend };
