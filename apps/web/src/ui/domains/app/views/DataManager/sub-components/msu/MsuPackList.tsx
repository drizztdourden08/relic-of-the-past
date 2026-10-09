/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Box, Status, IconButton, EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { formatBytes } from '@app/utils/formatBytes';
import { HookshopChip } from '@domains/app/compounds/HookshopChip';
import type { MsuPackListProps } from './MsuPackList.type';

const MsuPackList = (props: MsuPackListProps) => {
  const { packs, selected, isInstalled, onSelect, onDelete } = props;

  const handleDeleteClick = useCallback((e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    onDelete(name);
  }, [onDelete]);

  if (packs.length === 0) {
    return (
      <Box className="data-list">
        <EmptyState message="No music packs yet. Create an empty one or import a pack" />
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
              <Status tone={pack.format === 'layered' ? 'success' : 'neutral'}>
                {pack.format === 'layered' ? 'Layered' : 'Classic'}
              </Status>
            </>
          }
          badge={isInstalled(pack.name) ? <HookshopChip /> : undefined}
          selected={selected === pack.name}
          onClick={() => onSelect(pack.name)}
          action={
            <IconButton
              variant="ghost"
              size="sm"
              label={isInstalled(pack.name) ? 'Uninstall' : 'Delete'}
              onClick={(e) => handleDeleteClick(e, pack.name)}
            >
              ✕
            </IconButton>
          }
        />
      ))}
    </Box>
  );
};

export { MsuPackList };
