/* @layer renderer-widgets @kind component */
import { Box, Text } from '@drizztdourden08/tessera/primitives';
import { useNavigationOverlayStore } from '../../../stores/navigation-overlay-store';
import { ANNOTATION_STYLES } from '@app/navigation-overlay/annotation-style';
import type { AnnotationLayerProps } from './AnnotationLayer.type';
import './AnnotationLayer.css';

const AnnotationLayer = ({ annotations, cellLeft, cellTop, cellW, cellH }: AnnotationLayerProps) => {
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
            title={`${item.label}${item.detail ? ` - ${item.detail}` : ''}`}
            style={{ left: cellLeft + (item.tile.col / 64) * cellW - size / 2, top: cellTop + (item.tile.row / 64) * cellH - size / 2, width: size, height: size, background: style.color, opacity: settled ? 0.35 : 0.9, boxShadow: settled ? 'none' : '0 0 2px #000' }} className="nav-annotation-layer__marker"
          />
        );
      })}

      {(done > 0 || available > 0) && (
        <Box style={{ left: cellLeft + 2, top: cellTop + 2 }} className="nav-annotation-layer__badge">
          {done > 0 && <Text className="nav-annotation-layer__done">{done}✓</Text>}
          {available > 0 && <Text className="nav-annotation-layer__avail">{available}◦</Text>}
        </Box>
      )}
    </>
  );
};

export { AnnotationLayer };
