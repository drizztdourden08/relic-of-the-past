/* @layer renderer-components @kind component */
import { useRef, useState } from 'react';
import { Box, Pressable, Text } from '@drizztdourden08/tessera/primitives';
import { modeOf, modeSuffixOf } from '@app/hud-layout-editing/track-extents';
import { TrackSizeMenu } from './TrackSizeMenu';
import type { TrackHeadProps } from './TrackHead.type';

const TrackHead = (props: TrackHeadProps) => {
  const { axis, index, text, extent, selected, empty, title, onPointerDown, onSize } = props;
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const mode = modeOf(extent);
  const sizing = selected && onSize !== undefined;
  const isRow = axis === 'rows';

  return (
    <Box
      ref={anchor}
      className={`hud-lattice__head${isRow ? ' hud-lattice__head--row' : ''}`}
      role={isRow ? 'rowheader' : 'columnheader'}
      aria-selected={selected}
      aria-label={title}
      title={title}
      data-on={selected ? 'true' : undefined}
      data-empty={empty ? 'true' : undefined}
      data-inert={onPointerDown ? undefined : 'true'}
      data-index={index + 1}
      style={isRow
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
          {`${modeSuffixOf(mode)}▾`}
        </Pressable>
      ) : (
        <Text className="hud-lattice__head-text">{text}</Text>
      )}
      {open && (
        <TrackSizeMenu anchorRef={anchor} mode={mode} extent={extent} onSize={onSize} onClose={() => setOpen(false)} />
      )}
    </Box>
  );
};

export { TrackHead };
export type { TrackHeadProps } from './TrackHead.type';
