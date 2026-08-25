/* @layer renderer-components @kind component */
import { Box } from '@ds/primitives/Box';
import { Text } from '@ds/primitives/Text';
import { Button } from '@ds/primitives/Button';
import { Image } from '@ds/primitives/Image';
import { IconButton } from '@ds/primitives/IconButton';
import { EmptyState } from '@ds/primitives/EmptyState';
import { Badge } from '@ds/primitives/Badge';
import { ListItemRow } from '@ds/composites/ListItemRow';
import { ImportForm } from '../../DataManager/sub-components/ImportForm';
import type { LibraryEntry } from '../behavior/useSpriteLibrary';

interface SpriteLibraryListProps {
  entries: LibraryEntry[];
  selected: string | null;
  canCreate: boolean;
  onSelect: (name: string) => void;
  onCreate: () => void;
  onDelete: (name: string) => void;
  onUrlImport: (url: string) => Promise<{ success: boolean; message: string }>;
  onFileImport: (files: File[]) => Promise<{ success: boolean; message: string }>;
}

const SpriteLibraryList = (props: SpriteLibraryListProps) => {
  const { entries, selected, canCreate, onSelect, onCreate, onDelete, onUrlImport, onFileImport } = props;

  return (
    <>
      <Box className="sprite-library__create">
        <Button variant="secondary" size="sm" disabled={!canCreate} onClick={onCreate}>
          Create new sprite
        </Button>
        {!canCreate && (
          <Text className="sprite-library__hint">
            Needs a ROM with compiled assets — the stock sheet is read from it.
          </Text>
        )}
      </Box>
      <ImportForm
        kind="linkSprite"
        accept={['.zspr', '.rsp']}
        placeholder="Paste .zspr or .rsp URL…"
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
              : '🧝'}
            name={entry.label}
            meta={<Badge variant="neutral">{entry.container}</Badge>}
            selected={selected === entry.name}
            onClick={() => onSelect(entry.name)}
            action={
              <IconButton
                variant="ghost"
                size="sm"
                label="Delete"
                onClick={(e) => { e.stopPropagation(); onDelete(entry.name); }}
              >
                ✕
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
