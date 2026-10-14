/* @layer renderer-components @kind component */
import { EmptyState, Icon, IconButton, Stack } from '@drizztdourden08/tessera/primitives';
import { ListItemRow } from '@drizztdourden08/tessera/composites';
import type { ImportedSpriteListProps } from './sprite-manager.type';

const ImportedSpriteList = (props: ImportedSpriteListProps) => {
  const { importedRoms, extractedMap, selectedRom, onSelect, onDelete } = props;

  return (
    <Stack gap="xs">
      {importedRoms.length === 0 && <EmptyState message="No sprites extracted yet" />}
      {importedRoms.map((r) => (
        <ListItemRow
          key={r.romFile}
          icon={<Icon name="image" />}
          name={r.romFile}
          selected={selectedRom === r.romFile}
          onClick={() => onSelect(r.romFile)}
          meta={`${extractedMap[r.romFile]?.count ?? 0} sprite images`}
          action={
            <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); void onDelete(r.romFile); }}>
              <Icon name="x" />
            </IconButton>
          }
        />
      ))}
    </Stack>
  );
};

export { ImportedSpriteList };
