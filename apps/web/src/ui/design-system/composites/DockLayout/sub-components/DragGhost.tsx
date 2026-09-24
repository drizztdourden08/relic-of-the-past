/* @layer renderer-components @kind component */
/** The label that rides beside the pointer during a drag, with the mode held in its suffix. */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import type { Point } from '../behavior/drag-types';

interface DragGhostProps {
  pointer: Point;
  label: string;
}

/** How far the ghost sits from the pointer so the pointer never covers it. */
const GHOST_OFFSET = 12;

const DragGhost = (props: DragGhostProps) => {
  const { pointer, label } = props;
  const style = useMemo<CSSProperties>(
    () => ({ left: pointer.x + GHOST_OFFSET, top: pointer.y + GHOST_OFFSET }),
    [pointer.x, pointer.y],
  );
  return (
    <Box className="dock-ghost" style={style} aria-hidden="true">
      <Text className="dock-ghost__label">{label}</Text>
    </Box>
  );
};

export { DragGhost };
export type { DragGhostProps };
