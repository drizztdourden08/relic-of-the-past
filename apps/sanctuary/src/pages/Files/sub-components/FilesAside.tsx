/* @layer sanctuary-site @kind component */
import { Stack } from '@drizztdourden08/tessera/primitives';
import { FileDetail } from './FileDetail';
import { SelectionPanel } from './SelectionPanel';
import type { FilesAsideProps } from './FilesAside.type';

const FilesAside = (props: FilesAsideProps) => {
  const { page } = props;
  const { selected, drops } = page;
  const several = page.picked.length > 1;
  if (!selected && !several) return null;
  return (
    <Stack as="aside" gap="md" align="stretch" className="files__aside">
      {several && (
        <SelectionPanel
          files={page.picked}
          types={page.types}
          knownTags={page.knownTags}
          canEdit={page.canEdit}
          batch={page.batch}
          download={page.download}
          onClear={page.clearPick}
        />
      )}
      {selected && (
        <FileDetail
          key={selected.id}
          file={selected}
          knownTags={page.knownTags}
          types={page.types}
          canEdit={page.canEdit(selected)}
          canDelete={page.canEdit(selected)}
          actions={page.actions}
          onDropVersion={drops.dropOnFile}
          onClose={page.deselect}
        />
      )}
    </Stack>
  );
};

export { FilesAside };
