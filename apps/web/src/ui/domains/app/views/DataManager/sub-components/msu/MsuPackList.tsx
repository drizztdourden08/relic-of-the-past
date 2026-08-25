/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box } from '@ds/primitives/Box';
import { Badge } from '@ds/primitives/Badge';
import { IconButton } from '@ds/primitives/IconButton';
import { EmptyState } from '@ds/primitives/EmptyState';
import { ListItemRow } from '@ds/composites/ListItemRow';
import { formatBytes } from '@app/utils/formatBytes';
import type { MsuPackRow } from './msu.type';

interface MsuPackListProps {
  packs: MsuPackRow[];
  selected: string | null;
  onSelect: (name: string) => void;
  onDelete: (name: string) => void;
}

const MsuPackList = (props: MsuPackListProps) => {
  const { packs, selected, onSelect, onDelete } = props;

  const handleDeleteClick = useCallback((e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    onDelete(name);
  }, [onDelete]);

  if (packs.length === 0) {
    return (
      <Box className="data-list">
        <EmptyState message="No music packs yet — create an empty one or import a pack" />
      </Box>
    );
  }

  return (
    <Box className="data-list">
      {packs.map((pack) => (
        <ListItemRow
          key={pack.name}
          icon="🎵"
          name={pack.name}
          meta={
            <>
              {`${pack.fileCount} file${pack.fileCount !== 1 ? 's' : ''} · ${formatBytes(pack.totalSize)} · `}
              <Badge variant={pack.format === 'layered' ? 'success' : 'neutral'}>
                {pack.format === 'layered' ? 'Layered' : 'Classic'}
              </Badge>
            </>
          }
          selected={selected === pack.name}
          onClick={() => onSelect(pack.name)}
          action={
            <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => handleDeleteClick(e, pack.name)}>
              ✕
            </IconButton>
          }
        />
      ))}
    </Box>
  );
};

export { MsuPackList };
export type { MsuPackListProps };
