/* @layer renderer-components @kind component */
/**
 * Drop a column here to remove it. It exists only while a column is in the air.
 *
 * It renders as a plain child of the table's own container, absolutely
 * positioned rather than portalled. It used to escape to the shared overlay
 * layer, pinned to the viewport, because the table is its own scroll container
 * and its header slides sideways mid-drag — anything parked in the header row
 * itself could scroll out from under the cursor. Positioned against the
 * table's own box instead, it stays put regardless of how far the header has
 * slid, without needing a portal at all.
 *
 * Hover is local state — nothing outside this element cares whether the cursor
 * is over it, so it never goes near the headless hook.
 */
import { useState } from 'react';
import { Box } from '../../../primitives/Box';
import { Icon } from '../../../primitives/Icon';
import { Text } from '../../../primitives/Text';
import { TRASH_ICON_PATHS } from '../DataTable.constants';
import type { DragEvent } from 'react';

interface ColumnDropTrashProps {
  /** The column being carried; null means no drag, and nothing renders. */
  draggingPath: string | null;
  label: string;
  onRemove: (path: string) => void;
  onDragEnd: () => void;
}

const ColumnDropTrash = (props: ColumnDropTrashProps) => {
  const { draggingPath, label, onRemove, onDragEnd } = props;
  const [over, setOver] = useState(false);

  if (draggingPath === null) return null;

  const handleDragOver = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setOver(true);
  };

  const handleDrop = (event: DragEvent<HTMLElement>): void => {
    event.preventDefault();
    setOver(false);
    onRemove(draggingPath);
    /* The source header unmounts with its column, so its own dragend never lands. */
    onDragEnd();
  };

  return (
    <Box
      className={over ? 'data-table__trash data-table__trash--over' : 'data-table__trash'}
      aria-label={`Drop ${label} here to remove the column`}
      onDragOver={handleDragOver}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
    >
      <Icon
        paths={TRASH_ICON_PATHS}
        size={24}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Text className="data-table__trash-label">{over ? 'Release to remove' : 'Drop to remove'}</Text>
    </Box>
  );
};

export { ColumnDropTrash };
export type { ColumnDropTrashProps };
