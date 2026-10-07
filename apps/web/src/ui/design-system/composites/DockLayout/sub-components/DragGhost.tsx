/* @layer renderer-components @kind component */
/**
 * The label that rides beside the pointer during a drag, with the keys the
 * drag answers to listed under it. A key that is held lights up, so the mode
 * in effect is readable without remembering anything.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { Box } from '../../../primitives/Box';
import { Text } from '../../../primitives/Text';
import type { Point } from '../behavior/drag-types';

interface DragGhostProps {
  pointer: Point;
  label: string;
  swap: boolean;
  overlay: boolean;
  outside: boolean;
  canPopOut: boolean;
}

/** How far the ghost sits from the pointer so the pointer never covers it. */
const GHOST_OFFSET = 12;

const Key = (props: { keys: string; does: string; lit: boolean }) => {
  const { keys, does, lit } = props;
  return (
    <Box className={`dock-ghost__key${lit ? ' dock-ghost__key--lit' : ''}`}>
      <Text as="kbd" className="dock-ghost__kbd">{keys}</Text>
      <Text className="dock-ghost__does">{does}</Text>
    </Box>
  );
};

const DragGhost = (props: DragGhostProps) => {
  const { pointer, label, swap, overlay, outside, canPopOut } = props;
  const style = useMemo<CSSProperties>(
    () => ({ left: pointer.x + GHOST_OFFSET, top: pointer.y + GHOST_OFFSET }),
    [pointer.x, pointer.y],
  );
  return (
    <Box className="dock-ghost" style={style} aria-hidden="true">
      <Text className="dock-ghost__label">{label}</Text>
      <Box className="dock-ghost__keys">
        <Key keys="Shift" does="swap" lit={swap} />
        <Key keys="Ctrl" does="overlay" lit={overlay} />
        <Key keys="Esc" does="cancel" lit={false} />
        {canPopOut
          ? <Key keys="Past the edge" does="pop out" lit={outside} />
          : <Text className="dock-ghost__does">stays in the app</Text>}
      </Box>
    </Box>
  );
};

export { DragGhost };
export type { DragGhostProps };
