/* @layer renderer-components @kind component */
import { Box, Text, Button, Icon, Image, IconButton, EmptyState, Status } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { HookshopChip } from '../../../compounds/HookshopChip';
import { ImportForm } from '../../DataManager/sub-components/ImportForm';
import type { SpriteLibraryListProps } from '../PlayerSpriteStudio.type';

const SpriteLibraryList = (props: SpriteLibraryListProps) => {
  const { entries, selected, canCreate, isInstalled, onSelect, onCreate, onDelete, onUrlImport, onFileImport } = props;

  return (
    <>
      <Box className="sprite-library__create">
        <Button variant="secondary" size="sm" disabled={!canCreate} onClick={onCreate}>
          Create new sprite
        </Button>
        {!canCreate && (
          <Text className="sprite-library__hint">
            Needs a ROM with compiled assets, because the stock sheet is read from it.
          </Text>
        )}
      </Box>
      <ImportForm
        kind="linkSprite"
        accept={['.zspr', '.rsp']}
        placeholder="Paste .zspr or .rsp URL..."
        dropLabel="Drop a player sprite here"
        dropHint=".zspr or .rsp"
        onUrlImport={onUrlImport}
        onFileImport={onFileImport}
      />
      <Box className="data-list">
        {entries.length === 0 && <EmptyState message="No player sprites yet" />}
        {entries.map((entry) => (
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
      </Box>
    </>
  );
};

export { SpriteLibraryList };
export type { SpriteLibraryListProps };
