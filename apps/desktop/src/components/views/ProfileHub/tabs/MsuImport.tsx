import { useState, useCallback } from 'react';
import { DropZone } from '../../../primitives/DropZone';
import './MsuImport.css';

interface MsuImportProps {
  profileId: string;
}

export const MsuImport = (props: MsuImportProps) => {
  const { profileId } = props;
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ message: string; variant: '' | 'error' | 'success' }>({ message: '', variant: '' });
  const [busy, setBusy] = useState(false);

  const handleDownload = useCallback(async () => {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Basic URL validation
    try {
      new URL(trimmed);
    } catch {
      setStatus({ message: 'Invalid URL', variant: 'error' });
      return;
    }

    setBusy(true);
    setStatus({ message: 'Downloading…', variant: '' });

    try {
      const result = await window.api.importMsu(profileId, trimmed);
      if (result.success) {
        setStatus({ message: `Imported ${result.fileCount ?? 0} MSU files`, variant: 'success' });
        setUrl('');
      } else {
        setStatus({ message: result.error ?? 'Download failed', variant: 'error' });
      }
    } catch (e) {
      setStatus({ message: `${e}`, variant: 'error' });
    } finally {
      setBusy(false);
    }
  }, [url, profileId]);

  const handleDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setBusy(true);
    setStatus({ message: 'Importing…', variant: '' });

    try {
      // Use the file path from Electron's File object
      const filePath = window.api.getFilePath(files[0]);
      if (!filePath) {
        setStatus({ message: 'Could not read file path', variant: 'error' });
        return;
      }
      const result = await window.api.importMsuFile(profileId, filePath);
      if (result.success) {
        setStatus({ message: `Imported ${result.fileCount ?? 0} MSU files`, variant: 'success' });
      } else {
        setStatus({ message: result.error ?? 'Import failed', variant: 'error' });
      }
    } catch (e) {
      setStatus({ message: `${e}`, variant: 'error' });
    } finally {
      setBusy(false);
    }
  }, [profileId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !busy) handleDownload();
  };

  const statusClass = status.variant ? `msu-import__status msu-import__status--${status.variant}` : 'msu-import__status';

  return (
    <div className="msu-import">
      <div className="msu-import__url-row">
        <input
          className="msu-import__url-input"
          type="text"
          placeholder="Paste MSU pack download URL…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={busy}
        />
        <button
          className="msu-import__download-btn"
          onClick={handleDownload}
          disabled={busy || !url.trim()}
        >
          {busy ? '…' : 'Download'}
        </button>
      </div>
      <div className="msu-import__divider">or</div>
      <DropZone
        accept={['.zip', '.7z', '.rar']}
        label="Drop MSU pack here"
        hint=".zip, .7z, or .rar archive"
        disabled={busy}
        onDrop={handleDrop}
      />
      {status.message && <div className={statusClass}>{status.message}</div>}
    </div>
  );
}
