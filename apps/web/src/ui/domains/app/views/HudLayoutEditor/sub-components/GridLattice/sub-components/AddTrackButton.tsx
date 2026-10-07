/* @layer renderer-components @kind component */
/**
 * THE `+` AT THE END OF A HEADER STRIP. Just the icon, and the place it sits is
 * the sentence (§55). The maintainer: "the add column or row should be at the
 * very end of the grid component (next to the column selection last column on
 * its right) and same for row but on the bottom of that row selection last. just
 * a + icon."
 *
 * IT IS A HEADER CELL, NOT A BUTTON PARKED NEARBY. It places itself in the
 * lattice's own template at the address one past the last track, so it moves
 * with the strip, scrolls with the strip and sticks with the strip, so it
 * cannot drift away from the thing it extends, which is exactly what happened
 * to §54's `3 columns [+]` row up in the settings panel.
 *
 * IT IS NEVER PART OF A SELECTION. It carries no `data-on`, takes no
 * `pointerdown` that the lattice's drag could read, and appends through the same
 * document rule every other track edit uses (`grid-track-edits.ts` remaps every
 * child's `place`), so a press here cannot leave a child pointing at a track
 * that moved.
 */
import plusIcon from '@iconify-icons/lucide/plus';
import { Icon as IconifyIcon } from '@iconify/react/offline';
import { Button } from '@ds/primitives/Button';
import type { TrackAxis } from '../GridLattice.type';

const WORD: Record<TrackAxis, string> = { columns: 'column', rows: 'row' };

interface AddTrackButtonProps {
  axis: TrackAxis;
  /** The 1-based grid line it sits on, which is one past the last track's header. */
  at: number;
  onAdd: () => void;
}

const AddTrackButton = (props: AddTrackButtonProps) => {
  const { axis, at, onAdd } = props;
  const label = `Add a ${WORD[axis]} at the end`;
  return (
    <Button
      variant="bare"
      className={`hud-lattice__add hud-lattice__add--${axis}`}
      aria-label={label}
      title={label}
      data-action={axis === 'columns' ? 'add-column' : 'add-row'}
      style={axis === 'columns' ? { gridColumn: at, gridRow: 1 } : { gridColumn: 1, gridRow: at }}
      onPointerDown={(event) => event.stopPropagation()}
      onClick={onAdd}
    >
      <IconifyIcon icon={plusIcon} width={14} height={14} aria-hidden />
    </Button>
  );
};

export { AddTrackButton };
export type { AddTrackButtonProps };
