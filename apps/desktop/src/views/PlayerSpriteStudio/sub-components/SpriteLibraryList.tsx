/* @layer renderer-components @kind component */
import { Button, Icon, Image, IconButton, EmptyState, Status, Spinner, Stack, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { HookshopChip } from '../../../compounds/HookshopChip';
import { ImportForm } from '../../DataManager/sub-components/ImportForm';
import { NEEDS_ROM } from '../PlayerSpriteStudio.constants';
import type { SpriteLibraryListProps } from '../PlayerSpriteStudio.type';

const SpriteLibraryList = (props: SpriteLibraryListProps) => {
  const { entries, loading, selected, canCreate, busy, error, isInstalled, onSelect, onCreate, onDelete, onUrlImport, onFileImport } = props;

  return (
    <>
      <Button variant="primary" fullWidth icon={<Icon name="plus" />} disabled={!canCreate || busy} onClick={onCreate}>
        New sprite
      </Button>
      {!canCreate && <Text variant="caption" tone="muted">{NEEDS_ROM}</Text>}
      <ImportForm
        kind="linkSprite"
        accept={['.zspr', '.rsp']}
        placeholder="Paste .zspr or .rsp URL..."
        dropLabel="Drop a player sprite here"
        dropHint=".zspr or .rsp"
        onUrlImport={onUrlImport}
        onFileImport={onFileImport}
      />
      {error && <Text variant="caption" tone="danger" role="alert">{error}</Text>}
      <Stack gap="xs">
        {loading && <Spinner size="sm" label="Loading sprites" />}
        {!loading && entries.length === 0 && <EmptyState size="sm" message="No player sprites yet" />}
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
                label={isInstalled(entry.name) ? 'Uninstall' : 'Delete'}
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
