/* @layer renderer-components @kind component */
/**
 * ONE TRACK'S HEADER AND, SINCE §55, ITS SIZE CONTROL TOO.
 *
 * THE SIZE IS ON THE HEADER BECAUSE THE HEADER ALREADY SAID IT. A column header
 * has printed `auto` / `fill` / `24px` since §50; §54 then ALSO put an
 * `[auto ▾]` field in the contextual toolbar, which is the same fact twice and
 * cost the strip 81px, which forced it onto two rows at the 232px rail.
 * Here the printed word IS the control: select the track and its own label
 * becomes the button that opens the four-item menu.
 *
 * A ROW HEADER PRINTS ITS NUMBER AND SWAPS IT FOR ITS SIZE WHILE SELECTED. It
 * has 42px, not a column's ~55, and the toolbar's leading chip already says
 * `ROW 2` for exactly as long as the swap lasts, so nothing is unnameable at
 * any moment, and the gutter does not have to carry both at once.
 *
 * THE MENU IS `DropdownMenu`, so it is portalled (the lattice is a scroller and
 * would clip an inline one) and it registers on the dismiss stack at `menu`, so
 * one `Escape` closes the menu and leaves the editor behind it standing.
 */
import { useRef, useState } from 'react';
import { Box } from '@ds/primitives/Box';
import { Button } from '@ds/primitives/Button';
import { Text } from '@ds/primitives/Text';
import { DropdownMenu } from '@ds/composites/DropdownMenu';
import { EXTENT_MODES, extentFor, modeOf } from '../../../behavior/track-extents';
import type { PointerEvent } from 'react';
import type { Extent } from '@shared/types/hud';
import type { TrackAxis } from '../GridLattice.type';

interface TrackHeadProps {
  axis: TrackAxis;
  /** 0-based, the way the extent lists are indexed. */
  index: number;
  /** What the header prints when it is NOT the selected one. */
  text: string;
  extent: Extent | undefined;
  selected: boolean;
  /** Solved to nothing. It is drawn at the 24px floor, and said so. */
  empty: boolean;
  title: string;
  onPointerDown?: (event: PointerEvent) => void;
  onSize?: (extent: Extent) => void;
}

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
        <Button
          variant="bare"
          className="hud-lattice__size"
          aria-label={`${title}. Change its size`}
          aria-haspopup="menu"
          data-action="size"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => setOpen((was) => !was)}
        >
          {`${EXTENT_MODES.find((entry) => entry.mode === mode)?.suffix ?? 'auto'}▾`}
        </Button>
      ) : (
        <Text className="hud-lattice__head-text">{text}</Text>
      )}
      {open && (
        <DropdownMenu
          anchorRef={anchor}
          align="start"
          onClose={() => setOpen(false)}
          items={EXTENT_MODES.map((entry) => ({
            key: entry.mode,
            label: entry.label,
            checked: entry.mode === mode,
            onClick: () => { setOpen(false); onSize?.(extentFor(entry.mode, extent)); },
          }))}
        />
      )}
    </Box>
  );
};

export { TrackHead };
export type { TrackHeadProps };
