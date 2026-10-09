/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { DropdownMenu } from '@drizztdourden08/tessera/composites';
import { EXTENT_MODES, extentFor, modeOf } from '../../../behavior/track-extents';
import type { TrackHeadProps } from './TrackHead.type';

const TrackHead = (props: TrackHeadProps) => {
  const { axis, index, text, extent, selected, empty, title, onPointerDown, onSize } = props;
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const mode = modeOf(extent);
  const sizing = selected && onSize !== undefined;

  return (
    <Box
      ref={anchor}
      className={`hud-lattice__head${axis === 'rows' ? ' hud-lattice__head--row' : ''}`}
      role={axis === 'rows' ? 'rowheader' : 'columnheader'}
      aria-selected={selected}
      aria-label={title}
      title={title}
      data-on={selected ? 'true' : undefined}
      data-empty={empty ? 'true' : undefined}
      data-inert={onPointerDown ? undefined : 'true'}
      data-index={index + 1}
      style={axis === 'rows'
        ? { gridColumn: 1, gridRow: index + 2 }
        : { gridColumn: index + 2, gridRow: 1 }}
      onPointerDown={onPointerDown}
    >
      {sizing ? (
        <Pressable
          className="hud-lattice__size"
          aria-label={`${title}. Change its size`}
          aria-haspopup="menu"
          data-action="size"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setOpen((was) => !was)}
        >
          {`${EXTENT_MODES.find((entry) => entry.mode === mode)?.suffix ?? 'auto'}▾`}
        </Pressable>
      ) : (
        <Text className="hud-lattice__head-text">{text}</Text>
      )}
      {open && (
        <DropdownMenu
          anchorRef={anchor}
          align="start"
          onClose={() => setOpen(false)}
          groups={[{
            id: 'modes',
            items: EXTENT_MODES.map((entry) => ({
              id: entry.mode,
              label: entry.label,
              kind: 'radio' as const,
              checked: entry.mode === mode,
              onSelect: () => { setOpen(false); onSize?.(extentFor(entry.mode, extent)); },
            })),
          }]}
        />
      )}
    </Box>
  );
};

export { TrackHead };
export type { TrackHeadProps } from './TrackHead.type';
