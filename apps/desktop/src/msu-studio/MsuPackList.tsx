/* @layer renderer-components @kind component */
import { useCallback } from 'react';
import { Center, Icon, Status, IconButton, EmptyState, Spinner, Stack } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { useT } from '@drizztdourden08/brock-react';
import { formatBytes } from '@drizztdourden08/brock-core';
import { HookshopChip } from '@app/compounds/HookshopChip';
import type { MsuPackListProps } from './MsuPackList.type';

const MsuPackList = (props: MsuPackListProps) => {
  const { loading, packs, selected, isInstalled, onSelect, onDelete } = props;
  const t = useT();

  const handleDeleteClick = useCallback((e: React.MouseEvent, name: string) => {
    e.stopPropagation();
    onDelete(name);
  }, [onDelete]);

  if (loading) return <Center><Spinner /></Center>;

  if (packs.length === 0) {
    return (
      <Stack gap="xs">
        <EmptyState message={t('msu-studio:packs.empty')} />
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
              {t('msu-studio:packs.meta.summary', {
                files: t('msu-studio:packs.meta.files', { count: pack.fileCount }),
                size: formatBytes(pack.totalSize),
              })}
              {' '}
              <Status tone={pack.format === 'layered' ? 'success' : 'neutral'}>
                {pack.format === 'layered' ? t('msu-studio:pack.format.layered') : t('msu-studio:pack.format.classic')}
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
              label={isInstalled(pack.name) ? t('msu-studio:packs.uninstall') : t('msu-studio:packs.delete')}
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
