/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Icon, Status, IconButton, EmptyState, Stack } from '@drizztdourden08/tessera/primitives';
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
      <Stack gap="xs">
        <EmptyState message="No music packs yet. Create an empty one or import a pack" />
      </Stack>
    );
  }

  return (
    <Stack gap="xs">
      {packs.map((pack) => (
        <ListItemRow
          key={pack.name}
          icon={<Icon name="headphones" />}
          name={pack.name}
          meta={
            <>
              {`${pack.fileCount} file${pack.fileCount !== 1 ? 's' : ''} · ${formatBytes(pack.totalSize)} · `}
              <Status tone={pack.format === 'layered' ? 'success' : 'neutral'}>
                {pack.format === 'layered' ? 'Layered' : 'Classic'}
              </Status>
            </>
          }
          columns={isInstalled(pack.name) ? [{ primary: <HookshopChip />, align: 'end' }] : undefined}
          selected={selected === pack.name}
          onClick={() => onSelect(pack.name)}
          action={
            <IconButton
              variant="ghost"
              size="sm"
              label={isInstalled(pack.name) ? 'Uninstall' : 'Delete'}
              onClick={(e) => handleDeleteClick(e, pack.name)}
            >
              <Icon name="x" />
            </IconButton>
          }
        />
      ))}
    </Stack>
  );
};

export { MsuPackList };
