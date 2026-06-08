/* @layer renderer-components @kind component */
import { useState, useEffect, useCallback } from 'react';
import { ImportForm } from './ImportForm';
import { IconButton } from '../../../primitives/IconButton';
import { Select } from '../../../primitives/Select';
import { Field } from '../../../primitives/Field';
import { EmptyState } from '../../../primitives/EmptyState';
import { MasterDetailLayout } from '../../../composites/MasterDetailLayout';
import { ListItemRow } from '../../../composites/ListItemRow';

interface LanguageInfo {
  code: string;
  fileCount: number;
}

const LANGUAGE_NAMES: Record<string, string> = {
  en: 'English',
  de: 'German (Deutsch)',
  fr: 'French (Français)',
  'fr-c': 'French Canadian',
  es: 'Spanish (Español)',
  pl: 'Polish (Polski)',
  pt: 'Portuguese (Português)',
  nl: 'Dutch (Nederlands)',
  sv: 'Swedish (Svenska)',
  redux: 'Redux',
};

interface LanguageManagerProps {
  romStatuses: RomDisplayInfo[];
  onDeleteConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

const LanguageManager = (props: LanguageManagerProps) => {
  const { romStatuses, onDeleteConfirm } = props;
  const [languages, setLanguages] = useState<LanguageInfo[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [dialogue, setDialogue] = useState<string | null>(null);
  const [loadingDialogue, setLoadingDialogue] = useState(false);
  const [extractLang, setExtractLang] = useState('');

  const refresh = useCallback(async () => {
    const langs = await window.api.listLanguages();
    setLanguages(langs);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Load dialogue when selection changes
  useEffect(() => {
    if (!selected) { setDialogue(null); return; }
    setLoadingDialogue(true);
    window.api.getDialogue(selected).then((text) => {
      setDialogue(text);
      setLoadingDialogue(false);
    });
  }, [selected]);

  const handleUrlImport = useCallback(async (url: string) => {
    if (!extractLang) return { success: false, message: 'Select a language first' };
    const result = await window.api.extractLanguageFromUrl(url, extractLang);
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
    const filePath = window.api.getFilePath(files[0]);
    if (!filePath) return { success: false, message: 'Could not read file path' };
    const result = await window.api.extractLanguageFromFile(filePath, extractLang);
    if (result.success) {
      await refresh();
      setSelected(extractLang);
      return { success: true, message: `Extracted ${LANGUAGE_NAMES[extractLang] ?? extractLang} language pack` };
    }
    return { success: false, message: result.error ?? 'Extraction failed' };
  }, [extractLang, refresh]);

  const handleDelete = useCallback((code: string) => {
    const name = LANGUAGE_NAMES[code] ?? code;
    onDeleteConfirm('Delete Language', `Delete language pack "${name}"? This cannot be undone.`, async () => {
      await window.api.deleteLanguage(code);
      if (selected === code) { setSelected(null); setDialogue(null); }
      await refresh();
    });
  }, [selected, refresh, onDeleteConfirm]);

  const list = (
    <>
      {/* Language selector + ROM import form */}
      <div className="import-form" style={{ marginBottom: 0, paddingBottom: 'var(--space-xs)' }}>
        <Field label="Language">
          <Select
            value={extractLang}
            onChange={(val) => setExtractLang(val)}
            options={[
              { value: '', label: 'Select language…' },
              ...Object.entries(LANGUAGE_NAMES).map(([code, name]) => ({
                value: code,
                label: `${name} (${code})`,
              })),
            ]}
            placeholder="Select language…"
          />
        </Field>
      </div>
      <ImportForm
        placeholder="Paste ROM download URL…"
        accept={['.sfc', '.smc', '.zip', '.7z', '.rar']}
        dropLabel="Drop a ROM file to extract language"
        dropHint="The ROM is used temporarily and not saved"
        disabled={!extractLang}
        onUrlImport={handleUrlImport}
        onFileImport={handleFileImport}
      />

      <div className="data-list">
        {languages.length === 0 && <EmptyState message="No languages extracted yet" />}
        {languages.map((lang) => (
          <ListItemRow
            key={lang.code}
            icon="🌐"
            name={LANGUAGE_NAMES[lang.code] ?? lang.code}
            meta={`${lang.fileCount} file${lang.fileCount !== 1 ? 's' : ''}`}
            selected={selected === lang.code}
            onClick={() => setSelected(lang.code)}
            action={
              <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(lang.code); }}>
                ✕
              </IconButton>
            }
          />
        ))}
      </div>
    </>
  );

  const detail = !selected ? (
    <span>Select a language to view dialogue entries</span>
  ) : loadingDialogue ? (
    <span>Loading…</span>
  ) : dialogue ? (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <h3 className="detail-panel__title">{LANGUAGE_NAMES[selected] ?? selected}</h3>
      <div className="dialogue-viewer">{dialogue}</div>
    </div>
  ) : (
    <span>No dialogue data available</span>
  );

  return <MasterDetailLayout list={list} detail={detail} detailEmpty={!selected} />;
};

export { LanguageManager };
export type { LanguageManagerProps };
