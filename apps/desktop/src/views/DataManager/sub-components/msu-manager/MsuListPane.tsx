/* @layer renderer-components @kind component */
import { Text } from '@drizztdourden08/tessera/primitives';
import { ImportForm } from '../ImportForm';
import { MsuPackList } from '../../../../msu-studio/MsuPackList';
import { MsuPackToolbar } from '../../../../msu-studio/MsuPackToolbar';
import { MSU_IMPORT_COPY } from './msu-manager.constants';
import type { MsuListPaneProps } from './msu-manager.type';

const MsuListPane = (props: MsuListPaneProps) => {
  const { msu, nameInstalled, error, isInstalled, onDelete } = props;

  return (
    <>
      <Text variant="overline" tone="muted">New pack</Text>
      <MsuPackToolbar
        name={msu.newPackName}
        busy={msu.busy}
        nameInstalled={nameInstalled}
        onNameChange={msu.setNewPackName}
        onCreate={msu.handleCreatePack}
      />

      <Text variant="overline" tone="muted">Import a pack</Text>
      <ImportForm
        kind="msu"
        {...MSU_IMPORT_COPY}
        disabled={nameInstalled}
        onUrlImport={msu.handleUrlImport}
        onFileImport={msu.handleFileImport}
      />

      {error !== null && <Text variant="caption" tone="danger" role="alert">{error}</Text>}
      <MsuPackList
        loading={msu.loadingPacks}
        packs={msu.packs}
        selected={msu.selected}
        isInstalled={isInstalled}
        onSelect={msu.setSelected}
        onDelete={onDelete}
      />
    </>
  );
};

export { MsuListPane };
