/* @layer renderer-components @kind component */
import type { CSSProperties } from 'react';
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import type { ScreenAnnotations } from '@shared/game/simulation';
import { ANNOTATION_STYLES } from './annotation-style';
import { CollapsiblePanel } from './CollapsiblePanel';
import { useNavigationOverlayStore } from '@app/stores/navigation-overlay-store';

const S: Record<string, CSSProperties> = {
  row: { display: 'flex', alignItems: 'center', gap: 5 },
  dim: { color: 'var(--c-text-dim)' },
  off: { color: 'var(--c-text-faint)', textDecoration: 'line-through' },
  none: { color: 'var(--c-text-faint)', fontSize: 9 },
};

/**
 * Only the annotation kinds PRESENT get a legend row; a full 20-row key would dwarf the game view.
 * A kind switched off in the navigation widget shows struck through here.
 */
const OverlayLegend = ({ annotations }: { annotations?: readonly ScreenAnnotations[] }) => {
  const hiddenKinds = useNavigationOverlayStore((s) => s.hiddenKinds);
  const present = [...new Set((annotations ?? []).flatMap((s) => s.items).map((a) => a.kind))]
    .filter((k) => !ANNOTATION_STYLES[k]?.panelOnly);

  return (
    <CollapsiblePanel title="on this screen">
      {present.length === 0 && <Text style={S.none}>nothing detected yet. Run the flood</Text>}
      {present.map((kind) => {
        const off = hiddenKinds.has(kind);
        return (
          <Box
            key={kind}
            style={S.row}
            title={off ? 'Hidden. Re-enable it in the navigation widget.' : undefined}
          >
            <Text style={{ color: ANNOTATION_STYLES[kind].color, opacity: off ? 0.4 : 1 }}>
              {ANNOTATION_STYLES[kind].glyph}
            </Text>
            <Text style={off ? S.off : S.dim}>{ANNOTATION_STYLES[kind].legend}</Text>
          </Box>
        );
      })}
    </CollapsiblePanel>
  );
};

export { OverlayLegend };
