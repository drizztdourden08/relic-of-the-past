/* @layer renderer-components @kind component */
/**
 * The stage the widgets tile: lays the dock tree out over its own size, puts
 * every pane and floating widget in its rectangle, draws the dividers and the
 * game's grip, and runs the drags. The game itself is the host's: it gets the
 * play area's rectangle through onGameRect and draws there. Presentational:
 * every change leaves as a LayoutEdit.
 */
import { useEffect, useMemo, useRef } from 'react';
import type { Rect } from '@shared/types/widget-layout';
import { Box } from '../../primitives/Box';
import type { DockLayoutProps } from './DockLayout.type';
import type { DragContext } from './behavior/drag-types';
import { GAP, gameRectOf, layoutTree } from './behavior/layout-tree';
import { floatingRect } from './behavior/place-floating';
import { rectStyle, sameRect } from './behavior/rect-style';
import { useDockDrag } from './behavior/useDockDrag';
import { useStageSize } from './behavior/useStageSize';
import { Divider } from './sub-components/Divider';
import { DragGhost } from './sub-components/DragGhost';
import { DropHints } from './sub-components/DropHints';
import { GameGrip } from './sub-components/GameGrip';
import './DockLayout.css';

const DockLayout = (props: DockLayoutProps) => {
  const { layout, peek, modifiers, renderPane, renderFloating, onGameRect, onEdit, onPopOut, canPopOut, labelOf, className } = props;
  const stageRef = useRef<HTMLDivElement>(null);
  const size = useStageSize(stageRef);

  const stage = useMemo<Rect>(() => ({ x: 0, y: 0, width: size?.width ?? 0, height: size?.height ?? 0 }), [size]);
  const laid = useMemo(() => {
    if (!size) return null;
    const inner = { x: GAP, y: GAP, width: Math.max(0, size.width - GAP * 2), height: Math.max(0, size.height - GAP * 2) };
    return layoutTree(layout.dock, inner, peek);
  }, [layout.dock, peek, size]);
  const gameRect = useMemo(() => (laid ? gameRectOf(laid) : null), [laid]);

  const reported = useRef<Rect | null>(null);
  useEffect(() => {
    if (sameRect(reported.current, gameRect)) return;
    reported.current = gameRect;
    onGameRect(gameRect);
  }, [gameRect, onGameRect]);

  const context = useMemo<DragContext>(
    () => ({ laid, layout, gameRect, stage, modifiers, labelOf, canPopOut }),
    [laid, layout, gameRect, stage, modifiers, labelOf, canPopOut],
  );
  const { drag, dragId, onPointerDown } = useDockDrag({ stageRef, context, onEdit, onPopOut });

  const cls = ['dock-layout', drag && 'dock-layout--dragging', className].filter(Boolean).join(' ');

  return (
    <Box ref={stageRef} className={cls} data-testid="dock-layout" onPointerDown={onPointerDown}>
      {laid?.leaves.map(({ node, rect }) => node.kind === 'pane' && (
        <Box
          key={node.key}
          className={`dock-layout__pane${node.makeRoom ? '' : ' dock-layout__pane--overlay'}`}
          data-pane-key={node.key}
          style={rectStyle(rect)}
        >
          {renderPane(node, rect)}
        </Box>
      ))}
      {/* Keyed by position in the tree, never by rect: a divider moves while it is dragged and must not remount. */}
      {laid?.dividers.map((divider, i) => (
        <Divider key={`${divider.node.axis}-${i}`} divider={divider} onEdit={onEdit} />
      ))}
      {gameRect && <GameGrip rect={gameRect} stageRef={stageRef} />}
      {gameRect && layout.floating.map((floating) => {
        const live = drag?.floatingRect && dragId === floating.id ? drag.floatingRect : null;
        const rect = live ?? floatingRect(floating, gameRect);
        return (
          <Box key={floating.id} className="dock-layout__floating" data-floating-id={floating.id} style={rectStyle(rect)}>
            {renderFloating(floating, rect)}
          </Box>
        );
      })}
      {drag && laid && <DropHints view={drag} laid={laid} />}
      {drag && (
        <DragGhost
          pointer={drag.pointer}
          label={drag.label}
          swap={drag.swap}
          overlay={drag.overlay}
          outside={drag.outside}
          canPopOut={drag.canPopOut}
        />
      )}
    </Box>
  );
};

export { DockLayout };
