/* @layer renderer-components @kind component */
/**
 * Everything drawn over the stage while a drag is live: the outer strips, a
 * compass on every leaf, the preview of the drop, the swap outline, and the
 * pop-out ring past the window's edge. The hot zone is lit.
 */
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import type { DragView } from '../behavior/drag-types';
import type { DropZone } from '../behavior/hit-target';
import type { LaidOut } from '../behavior/layout-tree';
import { rectStyle } from '../behavior/rect-style';

interface DropHintsProps {
  view: DragView;
  laid: LaidOut;
}

const GLYPHS = { left: '◧', right: '◨', top: '⬒', bottom: '⬓', tab: '⧉' } as const;
const SWAP_LABEL = 'SWAP';
const POP_LABEL = 'RELEASE TO POP OUT';
const STAYS_LABEL = 'THIS WIDGET STAYS IN THE APP';

const glyphOf = (zone: DropZone): string => {
  const { target } = zone;
  if (target.at === 'tab') return GLYPHS.tab;
  if (target.at === 'outer' || target.at === 'leaf') return GLYPHS[target.edge];
  return '';
};

const keyOf = (zone: DropZone): string => {
  const { target } = zone;
  if (target.at === 'outer') return `outer-${target.edge}`;
  if (target.at === 'leaf') return `leaf-${target.key}-${target.edge}`;
  if (target.at === 'tab') return `tab-${target.key}`;
  return 'float';
};

const Zone = (props: { zone: DropZone; hot: boolean }) => {
  const { zone, hot } = props;
  const cls = `dock-hint dock-hint--${zone.kind}${hot ? ' dock-hint--hot' : ''}`;
  return (
    <Box className={cls} style={rectStyle(zone.hit)} aria-hidden="true">
      {zone.kind === 'compass' && <Text className="dock-hint__glyph">{glyphOf(zone)}</Text>}
    </Box>
  );
};

const DropHints = (props: DropHintsProps) => {
  const { view, laid } = props;
  const swapRect = view.swapKey ? laid.leaves.find((l) => l.node.key === view.swapKey)?.rect ?? null : null;

  return (
    <>
      {!view.swap && view.zones.filter((z) => z.kind !== 'float').map((zone) => (
        <Zone key={keyOf(zone)} zone={zone} hot={zone === view.hot} />
      ))}
      {view.preview && !view.outside && (
        <Box
          className={`dock-layout__preview${view.refused ? ' dock-layout__preview--refused' : ''}`}
          style={rectStyle(view.preview)}
          aria-hidden="true"
        />
      )}
      {swapRect && (
        <Box className="dock-layout__swap" style={rectStyle(swapRect)} aria-hidden="true">
          <Text className="dock-layout__swap-label">{SWAP_LABEL}</Text>
        </Box>
      )}
      {(view.outside || view.stays) && (
        <Box className={`dock-layout__popzone${view.stays ? ' dock-layout__popzone--stays' : ''}`} aria-hidden="true">
          <Text className="dock-layout__popzone-label">{view.stays ? STAYS_LABEL : POP_LABEL}</Text>
        </Box>
      )}
    </>
  );
};

export { DropHints };
export type { DropHintsProps };
