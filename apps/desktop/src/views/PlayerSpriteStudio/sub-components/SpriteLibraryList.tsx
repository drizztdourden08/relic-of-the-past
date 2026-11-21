/* @layer renderer-components @kind component */
import { useT } from '@drizztdourden08/brock-react';
import { Icon, Image, IconButton, EmptyState, Status, Spinner, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { HookshopChip } from '../../../compounds/HookshopChip';
import type { SpriteLibraryListProps } from '../PlayerSpriteStudio.type';

const SpriteLibraryList = (props: SpriteLibraryListProps) => {
  const t = useT();
  const { entries, loading, selected, error, isInstalled, onSelect, onDelete } = props;

  return (
    <>
      {error && <Text variant="caption" tone="danger" role="alert">{error}</Text>}
      <Stack gap="xs">
        {loading && <Spinner size="sm" label={t('views-player-sprite-studio:library.loading')} />}
        {!loading && entries.length === 0 && <EmptyState size="sm" message={t('views-player-sprite-studio:library.empty')} />}
        {!loading && entries.map((entry) => (
          <ListItemRow
            key={entry.name}
            icon={entry.preview
              ? <Image className="sprite-library__thumb" src={entry.preview} alt={entry.label} draggable={false} />
              : <Icon name="user" />}
            name={entry.label}
            meta={<Status tone="neutral">{entry.container}</Status>}
            columns={isInstalled(entry.name) ? [{ primary: <HookshopChip />, align: 'end' }] : undefined}
            selected={selected === entry.name}
            onClick={() => onSelect(entry.name)}
            action={
              <IconButton
                variant="ghost"
                size="sm"
                label={isInstalled(entry.name) ? t('views-player-sprite-studio:library.uninstall') : t('views-player-sprite-studio:library.delete')}
                onClick={(e) => { e.stopPropagation(); onDelete(entry.name); }}
              >
                <Icon name="x" />
              </IconButton>
            }
          />
        ))}
      </Stack>
    </>
  );
};

export { SpriteLibraryList };
