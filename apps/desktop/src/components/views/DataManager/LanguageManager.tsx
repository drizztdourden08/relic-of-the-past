import { useState, useEffect, useCallback } from 'react';
import { ImportForm } from './ImportForm';
import { IconButton } from '../../primitives/IconButton';
import { Select } from '../../primitives/Select';

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

export function LanguageManager({ romStatuses, onDeleteConfirm }: LanguageManagerProps) {
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

  return (
    <div className="data-columns">
      <div className="data-columns__left">
        {/* Language selector + ROM import form */}
        <div className="import-form" style={{ marginBottom: 0, paddingBottom: 'var(--space-xs)' }}>
          <div className="profile-form__field">
            <span className="profile-form__label">Language</span>
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
          </div>
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
          {languages.length === 0 && (
            <div className="data-list-empty" style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-text-faint)', fontSize: 'var(--text-sm)' }}>
              No languages extracted yet
            </div>
          )}
          {languages.map((lang) => (
            <div
              key={lang.code}
              className={`data-list-item ${selected === lang.code ? 'data-list-item--selected' : ''}`}
              onClick={() => setSelected(lang.code)}
            >
              <span className="data-list-item__icon">🌐</span>
              <div className="data-list-item__info">
                <div className="data-list-item__name">{LANGUAGE_NAMES[lang.code] ?? lang.code}</div>
                <div className="data-list-item__meta">{lang.fileCount} file{lang.fileCount !== 1 ? 's' : ''}</div>
              </div>
              <div className="data-list-item__action">
                <IconButton variant="ghost" size="sm" label="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(lang.code); }}>
                  ✕
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`data-columns__right ${!selected ? 'data-columns__right--empty' : ''}`}>
        {!selected ? (
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
        )}
      </div>
    </div>
  );
}
