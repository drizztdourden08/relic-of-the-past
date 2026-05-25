import { useEffect, useRef } from 'react';
import { Button } from '../../primitives/Button';
import type { UpdateState } from '../../../hooks/useAutoUpdate';
import './UpdateDialog.css';

interface UpdateDialogProps {
  open: boolean;
  state: UpdateState;
  onDownload: () => void;
  onInstall: () => void;
  onClose: () => void;
}

const UpdateDialog = ({ open, state, onDownload, onInstall, onClose }: UpdateDialogProps) => {
  const confirmRef = useRef<HTMLButtonElement>(null);

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
        <h3 className="dialog__title">Update Available</h3>

        {info && (
          <div className="update-dialog__info">
            <p className="update-dialog__version">
              Version <strong>{info.version}</strong> is available
            </p>
            {info.releaseNotes && (
              <div className="update-dialog__notes">
                <h4>Release Notes</h4>
                <div
                  className="update-dialog__notes-content"
                  dangerouslySetInnerHTML={{ __html: info.releaseNotes }}
                />
              </div>
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
