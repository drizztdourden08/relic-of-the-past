/* @layer renderer-components @kind component */
import { useState, useCallback } from 'react';
import { DropZone } from '../../../primitives/DropZone';
import { TextInput } from '../../../primitives/TextInput';

interface ImportFormProps {
  placeholder?: string;
  accept?: string[];
  dropLabel?: string;
  dropHint?: string;
  disabled?: boolean;
  onUrlImport: (url: string) => Promise<{ success: boolean; message: string }>;
  onFileImport: (files: File[]) => Promise<{ success: boolean; message: string }>;
}

const ImportForm = (props: ImportFormProps) => {
  const {
    placeholder = 'Paste download URL…',
    accept = ['.zip'],
    dropLabel = 'Drop files here',
    dropHint,
    disabled = false,
    onUrlImport,
    onFileImport,
  } = props;
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ message: string; variant: '' | 'error' | 'success' }>({ message: '', variant: '' });
  const [busy, setBusy] = useState(false);

  const isDisabled = disabled || busy;

  const handleDownload = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    try { new URL(trimmed); } catch {
      setStatus({ message: 'Invalid URL', variant: 'error' });
      return;
    }
    setBusy(true);
    setStatus({ message: 'Downloading…', variant: '' });
    try {
      const result = await onUrlImport(trimmed);
      setStatus({ message: result.message, variant: result.success ? 'success' : 'error' });
      if (result.success) setUrl('');
    } catch (e) {
      setStatus({ message: `${e}`, variant: 'error' });
    } finally {
      setBusy(false);
    }
  }, [url, onUrlImport]);

  const handleDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(true);
    setStatus({ message: 'Importing…', variant: '' });
    try {
      const result = await onFileImport(files);
      setStatus({ message: result.message, variant: result.success ? 'success' : 'error' });
    } catch (e) {
      setStatus({ message: `${e}`, variant: 'error' });
    } finally {
      setBusy(false);
    }
  }, [onFileImport]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isDisabled) handleDownload();
  };

  const statusClass = status.variant ? `import-form__status import-form__status--${status.variant}` : 'import-form__status';

  return (
    <div className="import-form">
      <div className="import-form__url-row">
        <TextInput
          className="import-form__url-input"
          type="text"
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
        />
        <button
          className="import-form__download-btn"
          onClick={handleDownload}
          disabled={isDisabled || !url.trim()}
        >
          {busy ? '…' : 'Download'}
        </button>
      </div>
      <div className="import-form__divider">or</div>
      <DropZone
        accept={accept}
        label={dropLabel}
        hint={dropHint}
        disabled={isDisabled}
        onDrop={handleDrop}
      />
      {status.message && <div className={statusClass}>{status.message}</div>}
    </div>
  );
};

export { ImportForm };
export type { ImportFormProps };
