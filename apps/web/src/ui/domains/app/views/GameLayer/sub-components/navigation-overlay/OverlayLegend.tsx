/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box } from '../../../../../../design-system/primitives/Box';
import { Text } from '../../../../../../design-system/primitives/Text';
import type { ScreenAnnotations } from '@shared/game/simulation';
import { ANNOTATION_STYLES } from './annotation-style';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';

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
  off: { color: 'var(--c-text-faint)', textDecoration: 'line-through' },
};

/** Only the annotation kinds actually present get a legend row — a full 20-row
 *  key would dwarf the game view and most screens carry a handful of kinds.
 *  Rows are display-only — this panel is pointer-events:none so it never eats a
 *  game click. A kind switched off in the widget shows struck through here. */
const OverlayLegend = ({ annotations }: { annotations?: readonly ScreenAnnotations[] }) => {
  const hiddenKinds = useNavigationOverlayStore((s) => s.hiddenKinds);
  const present = [...new Set((annotations ?? []).flatMap((s) => s.items).map((a) => a.kind))]
    .filter((k) => !ANNOTATION_STYLES[k]?.panelOnly);
  return (
    <Box style={S.panel}>
      <LegendItem color="var(--c-info)" label="reachable (free)" />
      <LegendItem color="var(--c-danger)" label="reachable (needs item)" />
      <LegendItem color="var(--c-danger)" label="cliff jump" isArrow />
      <LegendItem color="#ffffff" label="stairs (bidirectional)" isArrow />
      <LegendItem color="var(--c-info)" border="var(--c-green)" label="hookshot target" />
      {present.map((kind) => {
        const off = hiddenKinds.has(kind);
        return (
          <Box key={kind} style={S.row} title={off ? 'hidden — re-enable in the navigation widget' : undefined}>
            <Text style={{ color: ANNOTATION_STYLES[kind].color, fontSize: 12, opacity: off ? 0.4 : 1 }}>{ANNOTATION_STYLES[kind].glyph}</Text>
            <Text style={off ? S.off : S.dim}>{ANNOTATION_STYLES[kind].legend}</Text>
          </Box>
        );
      })}
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
