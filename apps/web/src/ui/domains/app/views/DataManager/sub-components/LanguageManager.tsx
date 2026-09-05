/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import type { CSSProperties } from 'react';
import type { LanguageSetSummary } from '@shared/storage/languages';
import { ImportForm } from './ImportForm';
import { LANGUAGE_NAMES } from './language-names';
import { LanguageEditor } from './language-editor';
import { SetCreateForm } from './language-editor/sub-components/SetCreateForm';
import * as languagesStore from '@app/lib/storage/languages-store';
import { Box } from '../../../../../design-system/primitives/Box';
import { IconButton } from '../../../../../design-system/primitives/IconButton';
import { Select } from '../../../../../design-system/primitives/Select';
import { Field } from '../../../../../design-system/primitives/Field';
import { EmptyState } from '../../../../../design-system/primitives/EmptyState';
import { MasterDetailLayout } from '../../../../../design-system/composites/MasterDetailLayout';
import { ListItemRow } from '../../../../../design-system/composites/ListItemRow';

const IL: Record<string, CSSProperties> = {
  importForm: { marginBottom: 0, paddingBottom: 'var(--space-xs)' },
};

interface LanguageManagerProps {
  romStatuses: RomDisplayInfo[];
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const LanguageManager = (props: LanguageManagerProps) => {
  const { onDeleteConfirm } = props;
  const [languages, setLanguages] = useState<LanguageSetSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [extractLang, setExtractLang] = useState('');
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const langs = await languagesStore.listLanguageSets();
    setLanguages(langs);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setLabel = useCallback(
    (set: LanguageSetSummary) => (set.origin === 'rom' ? LANGUAGE_NAMES[set.id] ?? set.name : set.name),
    [],
  );

  // Both writes rebake the asset blobs, so the list is locked while one runs.
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

  const handleDelete = useCallback((code: string) => {
    const name = LANGUAGE_NAMES[code] ?? code;
    onDeleteConfirm('Delete Language', `Delete language set "${name}"? This cannot be undone.`, async () => {
      await languagesStore.deleteLanguage(code);
      if (selected === code) setSelected(null);
      await refresh();
    });
  }, [selected, refresh, onDeleteConfirm]);

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
        sets={languages}
        busy={busy}
        onCreate={handleCreate}
        onDuplicate={handleDuplicate}
      />

      <Box className="data-list">
        {languages.length === 0 && <EmptyState message="No languages extracted yet" />}
        {languages.map((lang) => (
          <ListItemRow
            key={lang.id}
            icon="🌐"
            name={setLabel(lang)}
            meta={`${lang.lineCount} lines · base ${lang.base}${lang.origin === 'custom' ? ' · custom' : ''}`}
            selected={selected === lang.id}
            onClick={() => setSelected(lang.id)}
            action={
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(lang.id); }}>
                ✕
              </IconButton>
            }
          />
        ))}
      </Box>
    </>
  );

  const detail = <LanguageEditor id={selected} />;

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!selected} />;
};

export { LanguageManager };
export type { LanguageManagerProps };
