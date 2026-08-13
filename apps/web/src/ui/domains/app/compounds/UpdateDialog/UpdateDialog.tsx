/* @layer renderer-components @kind component */
import { useRef, useMemo } from 'react';
import { marked } from 'marked';
import { Box } from '../../../../design-system/primitives/Box';
import { Text } from '../../../../design-system/primitives/Text';
import { Button } from '../../../../design-system/primitives/Button';
import { Select } from '../../../../design-system/primitives/Select';
import { Toggle } from '../../../../design-system/primitives/Toggle';
import { ProgressBar } from '../../../../design-system/primitives/ProgressBar';
import { DialogShell } from '../../../../design-system/composites/DialogShell';
import { useVersionChoice } from './behavior/useVersionChoice';
import './UpdateDialog.css';
import { type UpdateDialogProps } from './UpdateDialog.type';

const renderNotes = (md: string): string => {
  const html = marked.parse(md, { async: false }) as string;
  // Strip <a> tags to plain text so links aren't clickable
  return html.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
};

const titleFor = (status: string, hasInfo: boolean): string =>
  status === 'checking' ? 'Checking for newer version...'
    : status === 'idle' && !hasInfo ? 'No Updates Available'
      : 'Update Available';

const UpdateDialog = (props: UpdateDialogProps) => {
  const { open, state, canInstall, onApply, onOpenReleasePage, onLoadVersions, onSetPrefs, onClose } = props;
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { info, status } = state;
  const { selected, setSelected, groups, chosen, isLatest } = useVersionChoice({
    open, state, loadVersions: onLoadVersions,
  });

  const notes = chosen?.releaseNotes ?? info?.releaseNotes ?? '';
  const notesHtml = useMemo(() => (notes ? renderNotes(notes) : ''), [notes]);
  const busy = status === 'downloading' || status === 'ready';

  const actionLabel = status === 'ready' ? 'Restarting...'
    : status === 'downloading' ? 'Downloading...'
      : chosen?.downgrade ? 'Install this version'
        : isLatest ? 'Update' : 'Install this version';

  const canAct = status === 'available' || status === 'downloading' || status === 'ready'
    || (status === 'idle' && !!state.versions.length);

  const actions = (
    <>
      <Button variant="tertiary" onClick={onClose}>Later</Button>
      {canInstall && canAct && (
        <Button ref={confirmRef} variant="primary" disabled={busy || !selected} onClick={() => onApply(isLatest ? null : selected)}>
          {actionLabel}
        </Button>
      )}
      {!canInstall && !!info && (
        <Button ref={confirmRef} variant="primary" onClick={() => onOpenReleasePage(info.version)}>
          Open the release page
        </Button>
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
      {status === 'checking' && <Text as="p" className="update-dialog__checking">Checking for newer version...</Text>}

      {status === 'idle' && !info && (
        <Text as="p" className="update-dialog__up-to-date">You&apos;re running the latest version.</Text>
      )}

      {info && (
        <Text as="p" className="update-dialog__version">
          Version <Text as="strong">{info.version}</Text> is available
        </Text>
      )}

      {canInstall && groups.length > 0 && (
        <Box className="update-dialog__picker">
          <Text className="update-dialog__picker-label">Version to install</Text>
          <Select value={selected} onChange={setSelected} groups={groups} disabled={busy} size="sm" />
        </Box>
      )}

      {notesHtml && (
        <Box className="update-dialog__notes">
          <Text as="h4">Release Notes</Text>
          <Box className="update-dialog__notes-content" dangerouslySetInnerHTML={{ __html: notesHtml }} />
        </Box>
      )}

      {status === 'downloading' && (
        <Box className="update-dialog__progress">
          <ProgressBar value={state.percent} />
          <Text className="update-dialog__progress-text">{Math.round(state.percent)}%</Text>
        </Box>
      )}

      {status === 'ready' && (
        <Text as="p" className="update-dialog__ready">
          Downloaded. The app closes and starts again on the new version.
        </Text>
      )}

      {!canInstall && !!info && (
        <Text as="p" className="update-dialog__manual">
          This build cannot update itself. The release page has the download.
        </Text>
      )}

      {status === 'error' && (
        <Text as="p" className="update-dialog__error">Update failed: {state.error}</Text>
      )}

      <Box className="update-dialog__prefs">
        <Toggle
          checked={state.prefs.allowPrerelease}
          onChange={(allowPrerelease) => onSetPrefs({ allowPrerelease })}
          disabled={busy}
          label="Include pre-releases"
        />
      </Box>
    </DialogShell>
  );
};

export { UpdateDialog };
