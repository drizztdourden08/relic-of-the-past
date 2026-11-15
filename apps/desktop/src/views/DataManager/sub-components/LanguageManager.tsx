/* @layer renderer-components @kind component */
import { EmptyState, Text } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import { useLanguageCreation } from './language-manager/useLanguageCreation';
import { useLanguageDelete } from './language-manager/useLanguageDelete';
import { useLanguageExtraction } from './language-manager/useLanguageExtraction';
import { useLanguageManagerDisplay } from './language-manager/useLanguageManagerDisplay';
import { useLanguageSets } from './language-manager/useLanguageSets';
import type { LanguageManagerProps } from './LanguageManager.type';
import { LanguageEditor } from '../../../language-editor';
import { NO_SET_MESSAGE } from '../../../language-editor/sub-components/studio-frame/studio-frame.constants';
import { SetCreateForm } from '../../../language-editor/sub-components/SetCreateForm';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '@app/views/InstalledOriginBar';
import { LanguagePatchedImport } from './LanguagePatchedImport';
import { LanguageRomImport } from './LanguageRomImport';
import { LanguageSetList } from './LanguageSetList';

const LanguageManager = (props: LanguageManagerProps) => {
  const { onDeleteConfirm } = props;
  const { languages, loading, selected, setSelected, refresh, refreshThenSelect } = useLanguageSets();
  const { handleUrlImport, handleFileImport } = useLanguageExtraction({ refresh, setSelected });
  const { busy, handleCreate, handleDuplicate } = useLanguageCreation({ refresh, setSelected });
  const { pack: installed, packFor } = useInstalledKind('language', selected);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const { handleDelete, handleUninstalled } = useLanguageDelete({
    selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm,
  });

  const { setLabel, isInstalled, ownSets } = useLanguageManagerDisplay({ languages, packFor });

  const origin = installed === null ? null : <InstalledOriginBar pack={installed} onDuplicated={refreshThenSelect} onUpdateInstalled={refreshThenSelect} onUninstalled={handleUninstalled} />;

  const setList = (
    <>
      {uninstallError !== null && <Text variant="caption" tone="danger" role="alert">{uninstallError}</Text>}
      <LanguageSetList sets={languages} loading={loading} selected={selected} labelOf={setLabel}
        isInstalled={isInstalled} onSelect={setSelected} onDelete={handleDelete} />
    </>
  );

  return (
    <ListDetailLayout listShowTitle={false}
      listContainers={[
        { title: 'Extract from a ROM', content: <LanguageRomImport onUrlImport={handleUrlImport} onFileImport={handleFileImport} /> },
        { title: 'Import patched ROM', content: <LanguagePatchedImport refresh={refresh} setSelected={setSelected} /> },
        {
          title: 'New set',
          content: <SetCreateForm sets={ownSets} busy={busy} onCreate={handleCreate} onDuplicate={handleDuplicate} />,
        },
        { title: 'Language sets', content: setList },
      ]}
      detail={selected && <LanguageEditor key={selected} id={selected} readOnly={installed !== null} origin={origin} />}
      emptyDetail={<EmptyState message={NO_SET_MESSAGE} />}
      detailScroll={false}
      storageKey="language-studio.list"
      listLabel="Language studio"
      detailLabel="Language editor"
    />
  );
};

export { LanguageManager };
