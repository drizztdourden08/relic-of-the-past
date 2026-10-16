/* @layer renderer-components @kind component */
import { Icon, Image, IconButton, EmptyState, Status, Spinner, Text } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import { HookshopChip } from '../../../compounds/HookshopChip';
import { StudioWell } from '../../../compounds/StudioFrame';
import { ImportForm } from '../../DataManager/sub-components/ImportForm';
import type { SpriteLibraryListProps } from '../PlayerSpriteStudio.type';

const SpriteLibraryList = (props: SpriteLibraryListProps) => {
  const { entries, loading, selected, isInstalled, onSelect, onDelete, onUrlImport, onFileImport } = props;

  return (
    <>
      <Text variant="overline" tone="muted">Add a sprite</Text>
      <ImportForm
        kind="linkSprite"
        accept={['.zspr', '.rsp']}
        placeholder="Paste .zspr or .rsp URL..."
        dropLabel="Drop a player sprite here"
        dropHint=".zspr or .rsp"
        onUrlImport={onUrlImport}
        onFileImport={onFileImport}
      />
      <Text variant="overline" tone="muted">In this app</Text>
      <StudioWell>
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
      </StudioWell>
    </>
  );
};

export { SpriteLibraryList };
