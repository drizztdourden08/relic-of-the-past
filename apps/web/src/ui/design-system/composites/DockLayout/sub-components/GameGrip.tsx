/* @layer renderer-components @kind component */
/**
 * The handle the play area is dragged by: a small pill at the top centre of
 * the game rect, faint until the pointer is over the game. The area itself
 * lets every event through; the pill is the only thing that takes one.
 */
import { useEffect, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { Rect } from '@shared/types/widget-layout';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import { inRect } from '../behavior/hit-target';
import { rectStyle } from '../behavior/rect-style';

interface GameGripProps {
  /** The play area, in stage pixels. */
  rect: Rect;
  /** Where the stage sits in the viewport, so pointer positions compare to the rect. */
  stageRef: RefObject<HTMLElement | null>;
}

const GRIP_LABEL = '⋮⋮ GAME';

const GameGrip = (props: GameGripProps) => {
  const { rect, stageRef } = props;
  const [hovered, setHovered] = useState(false);
  const style = useMemo(() => rectStyle(rect), [rect]);

  useEffect(() => {
    const onMove = (e: PointerEvent): void => {
      const stage = stageRef.current;
      if (!stage) return;
      const box = stage.getBoundingClientRect();
      const over = inRect({ x: e.clientX - box.left, y: e.clientY - box.top }, rect);
      setHovered((prev) => (prev === over ? prev : over));
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, [rect, stageRef]);

  return (
    <Box className={`dock-layout__game-area${hovered ? ' dock-layout__game-area--hover' : ''}`} style={style}>
      <Box className="dock-grip" data-drag-game="" title="Drag to move the play area">
        <Text className="dock-grip__label">{GRIP_LABEL}</Text>
      </Box>
    </Box>
  );
};

export { GameGrip };
export type { GameGripProps };
