/* @layer renderer-components @kind component */
import { useCallback, useMemo } from 'react';
import type { LanguageSetSummary } from '@rotp/languages';
import { StudioWell } from '@app/compounds/StudioFrame';
import { ImportForm } from './ImportForm';
import { LANGUAGE_NAMES } from './language-names.constants';
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
import { Text } from '@drizztdourden08/tessera/primitives';

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

  const setLabel = useCallback(
    (set: LanguageSetSummary) => (set.origin === 'rom' ? LANGUAGE_NAMES[set.id] ?? set.name : set.name),
    [],
  );
  const isInstalled = useCallback((code: string) => packFor(code) !== null, [packFor]);
  const ownSets = useMemo(() => languages.filter((set) => !isInstalled(set.id)), [languages, isInstalled]);

  const list = (
    <>
      {uninstallError !== null && <Text className="import-form__status import-form__status--error">{uninstallError}</Text>}
      <StudioWell>
        <LanguageSetList
          sets={languages}
          loading={loading}
          selected={selected}
          labelOf={setLabel}
          isInstalled={isInstalled}
          onSelect={setSelected}
          onDelete={handleDelete}
        />
      </StudioWell>

      <Text variant="overline" tone="muted">Extract from a ROM</Text>
      <ImportForm
        kind="language"
        placeholder="Paste ROM download URL..."
        accept={['.sfc', '.smc', '.zip', '.7z', '.rar']}
        dropLabel="Drop a ROM file to extract its language"
        dropHint="The language is detected from the ROM. The ROM is used temporarily and not saved"
        onUrlImport={handleUrlImport}
        onFileImport={handleFileImport}
      />

      <Text variant="overline" tone="muted">New set</Text>
      <SetCreateForm
        sets={ownSets}
        busy={busy}
        onCreate={handleCreate}
        onDuplicate={handleDuplicate}
      />
    </>
  );

  const origin = installed === null ? null : (
    <InstalledOriginBar pack={installed} onDuplicated={refreshThenSelect} onUpdateInstalled={refreshThenSelect} onUninstalled={handleUninstalled} />
  );

  return <LanguageEditor id={selected} readOnly={installed !== null} origin={origin} list={list} />;
};

export { LanguageManager };
