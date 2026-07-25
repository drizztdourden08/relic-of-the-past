/* @layer renderer-widgets @kind component */
import type { CSSProperties } from 'react';
import type { ScreenAnnotations } from '@shared/game/simulation';
import { Box, Text } from '../../../../design-system/primitives';
import { useNavigationOverlayStore } from '../../../../../stores/navigation-overlay-store';
import { ANNOTATION_STYLES } from '../../../app/views/GameLayer/sub-components/navigation-overlay/annotation-style';

/** Where the annotated screen's 64x64 tile grid sits on the minimap. */
interface Props {
  annotations: ScreenAnnotations | null;
  cellLeft: number;
  cellTop: number;
  cellW: number;
  cellH: number;
}

const IL: Record<string, CSSProperties> = {
  badge: {
    position: 'absolute', display: 'flex', gap: 3, padding: '0 3px',
    borderRadius: 'var(--r-sm)', background: 'var(--c-glass)', fontSize: 8,
    lineHeight: '10px', pointerEvents: 'none',
  },
  done: { color: 'var(--c-green-bright)' },
  avail: { color: 'var(--c-info)' },
};

/**
 * The minimap half of ScreenAnnotations: a dot per annotated tile plus the check
 * tally for the screen, so the small map shows the same mechanics as the overlay
 * instead of only reachability. Screen-wide kinds (room tags) have no tile and
 * are skipped — they live in the widget panel.
 */
const AnnotationLayer = ({ annotations, cellLeft, cellTop, cellW, cellH }: Props) => {
  const hiddenKinds = useNavigationOverlayStore((s) => s.hiddenKinds);
  if (!annotations) return null;
  const { done, available } = annotations.checks;
  const size = Math.max(3, (cellW * 3) / 64);

  return (
    <>
      {annotations.items.map((item, i) => {
        const style = ANNOTATION_STYLES[item.kind] ?? ANNOTATION_STYLES.unknown;
        if (style.panelOnly || hiddenKinds.has(item.kind)) return null;
        const settled = item.state === 'open' || item.state === 'done';
        return (
          <Box
            key={`anno-${i}-${item.kind}`}
            title={`${item.label}${item.detail ? ` — ${item.detail}` : ''}`}
            style={{
              position: 'absolute',
              left: cellLeft + (item.tile.col / 64) * cellW - size / 2,
              top: cellTop + (item.tile.row / 64) * cellH - size / 2,
              width: size, height: size, borderRadius: '50%',
              background: style.color, opacity: settled ? 0.35 : 0.9,
              boxShadow: settled ? 'none' : '0 0 2px #000', pointerEvents: 'none',
            }}
          />
        );
      })}

      {(done > 0 || available > 0) && (
        <Box style={{ ...IL.badge, left: cellLeft + 2, top: cellTop + 2 }}>
          {done > 0 && <Text style={IL.done}>{done}✓</Text>}
          {available > 0 && <Text style={IL.avail}>{available}◦</Text>}
        </Box>
      )}
    </>
  );
};

export { AnnotationLayer };
