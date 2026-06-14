/* @layer renderer-components @kind component */
import { useState, useCallback } from 'react';
import { DropZone } from '../../../../../design-system/primitives/DropZone';
import { TextInput } from '../../../../../design-system/primitives/TextInput';
import { Box } from '../../../../../design-system/primitives/Box';
import { Button } from '../../../../../design-system/primitives/Button';
import { ImportProgress } from './ImportProgress';
import { useImportProgress } from '@app/hooks/useImportProgress';
import type { ImportKind } from '@app/hooks/useImportProgress';

interface ImportFormProps {
  /** Which import this form drives — scopes the progress events it listens to. */
  kind: ImportKind;
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
    kind,
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
  const progress = useImportProgress(kind);

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
    <Box className="import-form">
      <Box className="import-form__url-row">
        <TextInput
          className="import-form__url-input"
          type="text"
          placeholder={placeholder}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled}
        />
        <Button
          variant="bare"
          className="import-form__download-btn"
          onClick={handleDownload}
          disabled={isDisabled || !url.trim()}
        >
          {busy ? '…' : 'Download'}
        </Button>
      </Box>
      <Box className="import-form__divider">or</Box>
      <DropZone
        accept={accept}
        label={dropLabel}
        hint={dropHint}
        disabled={isDisabled}
        onDrop={handleDrop}
      />
      {busy
        ? <ImportProgress state={progress} fallbackLabel={status.message || undefined} />
        : status.message
          ? <Box className={statusClass}>{status.message}</Box>
          : null}
    </Box>
  );
};

export { ImportForm };
export type { ImportFormProps };
