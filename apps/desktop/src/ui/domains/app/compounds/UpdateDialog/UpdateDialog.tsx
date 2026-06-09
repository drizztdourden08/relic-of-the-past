/* @layer renderer-components @kind component */
import { useRef, useMemo } from 'react';
import { marked } from 'marked';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Button } from '../../../../design-system/primitives/Button';
import { ProgressBar } from '../../../../design-system/primitives/ProgressBar';
import { DialogShell } from '../../../../design-system/composites/DialogShell';
import './UpdateDialog.css';
import { type UpdateDialogProps } from './UpdateDialog.type';

const renderNotes = (md: string): string => {
  const html = marked.parse(md, { async: false }) as string;
  // Strip <a> tags to plain text so links aren't clickable
  return html.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
};

const formatBytes = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const titleFor = (status: string, hasInfo: boolean): string =>
  status === 'checking' ? 'Checking for Updates'
    : status === 'idle' && !hasInfo ? 'No Updates Available'
      : 'Update Available';

const UpdateDialog = (props: UpdateDialogProps) => {
  const { open, state, onDownload, onInstall, onClose } = props;
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { info, status, progress } = state;

  const notesHtml = useMemo(
    () => (state.info?.releaseNotes ? renderNotes(state.info.releaseNotes) : ''),
    [state.info?.releaseNotes],
  );

  const actions = (
    <>
      <Button variant="tertiary" onClick={onClose}>{status === 'ready' ? 'Later' : 'Cancel'}</Button>
      {status === 'available' && (
        <Button ref={confirmRef} variant="primary" onClick={onDownload}>Update</Button>
      )}
      {status === 'ready' && (
        <Button ref={confirmRef} variant="primary" onClick={onInstall}>Restart &amp; Update</Button>
      )}
    </>
  );

  return (
    <DialogShell
      open={open}
      onClose={onClose}
      className="update-dialog"
      title={titleFor(status, !!info)}
      actions={actions}
      initialFocusRef={confirmRef}
    >
      {status === 'checking' && <Text as="p" className="update-dialog__checking">Checking for updates...</Text>}

      {status === 'idle' && !info && (
        <Text as="p" className="update-dialog__up-to-date">You&apos;re running the latest version.</Text>
      )}

      {info && (
        <Box className="update-dialog__info">
          <Text as="p" className="update-dialog__version">
            Version <Text as="strong">{info.version}</Text> is available
          </Text>
          {info.releaseNotes ? (
            <Box className="update-dialog__notes">
              <Text as="h4">Release Notes</Text>
              <Box className="update-dialog__notes-content" dangerouslySetInnerHTML={{ __html: notesHtml }} />
            </Box>
          ) : (
            <Text as="p" className="update-dialog__no-notes">A new version is ready to install.</Text>
          )}
        </Box>
      )}

      {status === 'downloading' && progress && (
        <Box className="update-dialog__progress">
          <ProgressBar value={progress.percent} />
          <Text className="update-dialog__progress-text">
            {Math.round(progress.percent)}% — {formatBytes(progress.transferred)} / {formatBytes(progress.total)}
          </Text>
        </Box>
      )}

      {status === 'ready' && (
        <Text as="p" className="update-dialog__ready">
          Download complete. The app will restart to apply the update.
        </Text>
      )}

      {status === 'error' && (
        <Text as="p" className="update-dialog__error">Update failed: {state.error}</Text>
      )}
    </DialogShell>
  );
};

export { UpdateDialog };
