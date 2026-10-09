/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { LanguageSetSummary } from '@shared/storage/languages';
import { ImportForm } from './ImportForm';
import { LANGUAGE_NAMES } from './language-names.constants';
import { IL } from './LanguageManager.constants';
import type { LanguageManagerProps } from './LanguageManager.type';
import { LanguageEditor } from './language-editor';
import { SetCreateForm } from './language-editor/sub-components/SetCreateForm';
import * as languagesStore from '@app/lib/storage/languages-store';
import { useInstalledKind } from '@app/hooks/useInstalledKind';
import { InstalledOriginBar, useConfirmUninstall } from '@domains/app/views/InstalledOriginBar';
import { LanguageSetList } from './LanguageSetList';
import { Text, Box, Select, Field, EmptyState } from '@drizztdourden08/tessera/primitives';
import { ListDetailLayout } from '@drizztdourden08/tessera/composites';
import './DataManager.lists.css';
import './DataManager.forms.css';
import './DataManager.detail.css';

const LanguageManager = (props: LanguageManagerProps) => {
  const { onDeleteConfirm } = props;
  const [languages, setLanguages] = useState<LanguageSetSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [extractLang, setExtractLang] = useState('');
  const [busy, setBusy] = useState(false);
  const { pack: installed, packFor } = useInstalledKind('language', selected);
  const { confirmUninstall, uninstallError } = useConfirmUninstall(onDeleteConfirm);

  const refresh = useCallback(async () => {
    const langs = await languagesStore.listLanguageSets();
    setLanguages(langs);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setLabel = useCallback(
    (set: LanguageSetSummary) => (set.origin === 'rom' ? LANGUAGE_NAMES[set.id] ?? set.name : set.name),
    [],
  );

  const handleCreate = useCallback(async (id: string, name: string, base: string) => {
    setBusy(true);
    try {
      await languagesStore.createLanguageSet({ id, name, base });
      await refresh();
      setSelected(id);
    } finally { setBusy(false); }
  }, [refresh]);

  const handleDuplicate = useCallback(async (sourceId: string, id: string, name: string) => {
    setBusy(true);
    try {
      await languagesStore.duplicateLanguageSet(sourceId, id, name);
      await refresh();
      setSelected(id);
    } finally { setBusy(false); }
  }, [refresh]);

  const handleUrlImport = useCallback(async (url: string) => {
    if (!extractLang) return { success: false, message: 'Select a language first' };
    const result = await languagesStore.extractLanguageFromUrl(url, extractLang);
    if (result.success) {
      await refresh();
      setSelected(extractLang);
      return { success: true, message: `Extracted ${LANGUAGE_NAMES[extractLang] ?? extractLang} language pack` };
    }
    return { success: false, message: result.error ?? 'Extraction failed' };
  }, [extractLang, refresh]);

  const handleFileImport = useCallback(async (files: File[]) => {
    if (files.length === 0) return { success: false, message: 'No file selected' };
    if (!extractLang) return { success: false, message: 'Select a language first' };
    const result = await languagesStore.extractLanguageFromFile(files[0], extractLang);
    if (result.success) {
      await refresh();
      setSelected(extractLang);
      return { success: true, message: `Extracted ${LANGUAGE_NAMES[extractLang] ?? extractLang} language pack` };
    }
    return { success: false, message: result.error ?? 'Extraction failed' };
  }, [extractLang, refresh]);

  const forget = useCallback(async (code: string) => {
    if (selected === code) setSelected(null);
    await refresh();
  }, [selected, refresh]);

  const handleDelete = useCallback((code: string) => {
    const owner = packFor(code);
    if (owner) {
      confirmUninstall(owner, () => { void forget(code); });
      return;
    }
    const name = LANGUAGE_NAMES[code] ?? code;
    onDeleteConfirm('Delete Language', `Delete language set "${name}"? This cannot be undone.`, async () => {
      await languagesStore.deleteLanguage(code);
      await forget(code);
    });
  }, [packFor, confirmUninstall, forget, onDeleteConfirm]);

  const isInstalled = useCallback((code: string) => packFor(code) !== null, [packFor]);
  const ownSets = useMemo(() => languages.filter((set) => !isInstalled(set.id)), [languages, isInstalled]);

  const refreshThenSelect = useCallback((code: string) => {
    void refresh().then(() => setSelected(code));
  }, [refresh]);

  const handleUninstalled = useCallback(() => {
    if (selected !== null) void forget(selected);
  }, [selected, forget]);

  const list = (
    <>
      <Box className="import-form" style={IL.importForm}>
        <Field label="Language">
          <Select
            value={extractLang}
            onChange={(val) => setExtractLang(val)}
            options={[
              { value: '', label: 'Select language...' },
              ...Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
                value: code,
                label: `${name} (${code})`,
              })),
            ]}
            placeholder="Select language..."
          />
        </Field>
      </Box>
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
    <InstalledOriginBar pack={installed} onDuplicated={refreshThenSelect} onUpdated={refreshThenSelect} onUninstalled={handleUninstalled} />
  );
  const detail = selected ? <LanguageEditor id={selected} readOnly={installed !== null} origin={origin} /> : null;

  return <ListDetailLayout list={list} detail={detail} emptyDetail={<EmptyState message="Select a language set to edit" />} />;
};

export { LanguageManager };
