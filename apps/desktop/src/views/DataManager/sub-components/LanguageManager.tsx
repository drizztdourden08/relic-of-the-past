/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import type { LanguageSetSummary } from '@rotp/languages';
import { ImportForm } from './ImportForm';
import { LANGUAGE_NAMES } from './language-names.constants';
import { ExtractLanguagePicker } from './language-manager/ExtractLanguagePicker';
import { useLanguageCreation } from './language-manager/useLanguageCreation';
import { useLanguageDelete } from './language-manager/useLanguageDelete';
import { useLanguageExtraction } from './language-manager/useLanguageExtraction';
import { useLanguageSets } from './language-manager/useLanguageSets';
import type { LanguageManagerProps } from './LanguageManager.type';
import { LanguageEditor } from '../../../language-editor';
import { SetCreateForm } from '../../../language-editor/sub-components/SetCreateForm';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '@app/views/InstalledOriginBar';
import { LanguageSetList } from './LanguageSetList';
import { Text, EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';

const LanguageManager = (props: LanguageManagerProps) => {
  const { onDeleteConfirm } = props;
  const { languages, selected, setSelected, refresh, refreshThenSelect } = useLanguageSets();
  const { extractLang, setExtractLang, handleUrlImport, handleFileImport } = useLanguageExtraction({ refresh, setSelected });
  const { busy, handleCreate, handleDuplicate } = useLanguageCreation({ refresh, setSelected });
  const { pack: installed, packFor } = useInstalledKind('language', selected);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);
  const { handleDelete, handleUninstalled } = useLanguageDelete({
    selected, setSelected, refresh, packFor, confirmUninstall, onDeleteConfirm,
  });

  const setLabel = useCallback(
    (set: LanguageSetSummary) => (set.origin === 'rom' ? LANGUAGE_NAMES[set.id] ?? set.name : set.name),
    [],
  );
  const isInstalled = useCallback((code: string) => packFor(code) !== null, [packFor]);
  const ownSets = useMemo(() => languages.filter((set) => !isInstalled(set.id)), [languages, isInstalled]);

  const list = (
    <>
      <ExtractLanguagePicker value={extractLang} onChange={setExtractLang} />
      <ImportForm
        kind="language"
        placeholder="Paste ROM download URL..."
        accept={['.sfc', '.smc', '.zip', '.7z', '.rar']}
        dropLabel="Drop a ROM file to extract language"
        dropHint="The ROM is used temporarily and not saved"
        disabled={!extractLang}
        onUrlImport={handleUrlImport}
        onFileImport={handleFileImport}
      />

      <SetCreateForm
        sets={ownSets}
        busy={busy}
        onCreate={handleCreate}
        onDuplicate={handleDuplicate}
      />

      {uninstallError !== null && <Text className="import-form__status import-form__status--error">{uninstallError}</Text>}
      <LanguageSetList
        sets={languages}
        selected={selected}
        labelOf={setLabel}
        isInstalled={isInstalled}
        onSelect={setSelected}
        onDelete={handleDelete}
      />
    </>
  );

  const origin = installed === null ? null : (
    <InstalledOriginBar pack={installed} onDuplicated={refreshThenSelect} onUpdateInstalled={refreshThenSelect} onUninstalled={handleUninstalled} />
  );
  const detail = selected ? <LanguageEditor id={selected} readOnly={installed !== null} origin={origin} /> : null;

  return <ListDetailLayout list={list} detail={detail} emptyDetail={<EmptyState message="Select a language set to edit" />} />;
};

export { LanguageManager };
