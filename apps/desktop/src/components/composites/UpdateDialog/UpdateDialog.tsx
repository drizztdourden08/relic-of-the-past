import { useEffect, useRef, useMemo } from 'react';
import { marked } from 'marked';
import { Button } from '../../primitives/Button';
import type { UpdateState } from '../../../hooks/useAutoUpdate';
import './UpdateDialog.css';

function renderNotes(md: string): string {
  const html = marked.parse(md, { async: false }) as string;
  // Strip <a> tags to plain text so links aren't clickable
  return html.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
}

interface UpdateDialogProps {
  open: boolean;
  state: UpdateState;
  onDownload: () => void;
  onInstall: () => void;
  onClose: () => void;
}

const UpdateDialog = ({ open, state, onDownload, onInstall, onClose }: UpdateDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

  const notesHtml = useMemo(() => {
    if (!state.info?.releaseNotes) return '';
    return renderNotes(state.info.releaseNotes);
  }, [state.info?.releaseNotes]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); onClose(); }
    };
    document.addEventListener('keydown', handler);
    confirmRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  const { info, status, progress } = state;

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog update-dialog" onClick={(e) => e.stopPropagation()}>
        <h3 className="dialog__title">
          {status === 'checking' ? 'Checking for Updates' : status === 'idle' && !info ? 'No Updates Available' : 'Update Available'}
        </h3>

        {status === 'checking' && (
          <p className="update-dialog__checking">Checking for updates...</p>
        )}

        {status === 'idle' && !info && (
          <p className="update-dialog__up-to-date">You're running the latest version.</p>
        )}

        {info && (
          <div className="update-dialog__info">
            <p className="update-dialog__version">
              Version <strong>{info.version}</strong> is available
            </p>
            {info.releaseNotes ? (
              <div className="update-dialog__notes">
                <h4>Release Notes</h4>
                <div
                  className="update-dialog__notes-content"
                  dangerouslySetInnerHTML={{ __html: notesHtml }}
                />
              </div>
            ) : (
              <p className="update-dialog__no-notes">
                A new version is ready to install.
              </p>
            )}
          </div>
        )}

        {status === 'downloading' && progress && (
          <div className="update-dialog__progress">
            <div className="update-dialog__progress-bar">
              <div
                className="update-dialog__progress-fill"
                style={{ width: `${progress.percent}%` }}
              />
            </div>
            <span className="update-dialog__progress-text">
              {Math.round(progress.percent)}% — {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
            </span>
          </div>
        )}

        {status === 'ready' && (
          <p className="update-dialog__ready">
            Download complete. The app will restart to apply the update.
          </p>
        )}

        {status === 'error' && (
          <p className="update-dialog__error">
            Update failed: {state.error}
          </p>
        )}

        <div className="dialog__actions">
          <Button variant="secondary" onClick={onClose}>
            {status === 'ready' ? 'Later' : 'Cancel'}
          </Button>
          {status === 'available' && (
            <Button ref={confirmRef} variant="primary" onClick={onDownload}>
              Update
            </Button>
          )}
          {status === 'ready' && (
            <Button ref={confirmRef} variant="primary" onClick={onInstall}>
              Restart & Update
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export { UpdateDialog };
