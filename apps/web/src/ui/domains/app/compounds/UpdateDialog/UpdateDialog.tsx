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
import { describeTargetCompat } from '@shared/game/save-state';
import type { TargetCompat } from '@shared/game/save-state';
import { BugReportButton } from '../BugReportButton';
import { useVersionChoice } from './behavior/useVersionChoice';
import './UpdateDialog.css';
import { type UpdateDialogProps } from './UpdateDialog.type';

const renderNotes = (md: string): string => {
  const html = marked.parse(md, { async: false }) as string;
  // Strip <a> tags to plain text so links aren't clickable
  return html.replace(/<a[^>]*>(.*?)<\/a>/g, '$1');
};

/**
 * A confirmed break and "could not check" are different claims, so they get different
 * headings and different colours. Saying the second one in red would teach people to
 * ignore the red.
 */
const saveStateTitle = (compat: TargetCompat): string =>
  (compat.kind === 'incompatible'
    ? 'Your save states will not load'
    : 'Save state compatibility could not be checked');

const titleFor = (status: string, hasInfo: boolean): string =>
  status === 'checking' ? 'Checking for newer version...'
    : hasInfo ? 'Update Available'
      : 'Up To Date';

const UpdateDialog = (props: UpdateDialogProps) => {
  const { open, state, canInstall, onApply, onOpenReleasePage, onLoadVersions, onSetPrefs, onReportBug, onClose } = props;
  const confirmRef = useRef<HTMLButtonElement>(null);
  const { info, status, currentVersion } = state;
  const { selected, setSelected, groups, chosen, isLatest, actionLabel } = useVersionChoice({
    open, state, loadVersions: onLoadVersions,
  });

  const notes = chosen?.releaseNotes ?? info?.releaseNotes ?? '';
  const notesHtml = useMemo(() => (notes ? renderNotes(notes) : ''), [notes]);
  const busy = status === 'downloading' || status === 'ready';

  // Follows the picker, not the offered update, so switching rows re-answers it.
  // Reinstalling the running version is the one case with nothing to say.
  const saveStates = chosen?.saveStates ?? info?.saveStates ?? null;
  const saveStateNote = saveStates && !chosen?.installed
    ? describeTargetCompat(saveStates, currentVersion)
    : null;

  const buttonLabel = status === 'ready' ? 'Restarting...'
    : status === 'downloading' ? 'Downloading...'
      : actionLabel;

  const canAct = status === 'available' || status === 'downloading' || status === 'ready'
    || (status === 'idle' && !!state.versions.length);

  const actions = (
    <>
      <Button variant="tertiary" onClick={onClose}>Later</Button>
      {canInstall && canAct && (
        <Button ref={confirmRef} variant="primary" disabled={busy || !selected} onClick={() => onApply(isLatest ? null : selected)}>
          {buttonLabel}
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
      {/* One column with one gap, so every combination of the blocks below is spaced
          the same and nothing depends on which of them happen to be visible. */}
      <Box className="update-dialog__body">
        {status === 'checking' && <Text as="p" className="update-dialog__status">Checking for newer version...</Text>}

        {info && (
          <Text as="p" className="update-dialog__version">
            Version <Text as="strong">{info.version}</Text> is available
          </Text>
        )}

        {status !== 'checking' && !info && (
          <Text as="p" className="update-dialog__version">
            Version <Text as="strong">{currentVersion}</Text> is the latest
          </Text>
        )}

        {canInstall && groups.length > 0 && (
          <Box className="update-dialog__prefs">
            <Toggle
              checked={state.prefs.allowPrerelease}
              onChange={(allowPrerelease) => onSetPrefs({ allowPrerelease })}
              disabled={busy}
              label="Include pre-releases"
            />
          </Box>
        )}

        {canInstall && groups.length > 0 && (
          <Box className="update-dialog__picker">
            <Text className="update-dialog__picker-label">Version to install</Text>
            <Select value={selected} onChange={setSelected} groups={groups} disabled={busy} size="sm" />
          </Box>
        )}

        {chosen?.prerelease && (
          <Box className="update-dialog__warning" role="note">
            This is a pre-release. It ships before the usual testing, so expect rough edges and
            bugs the stable builds do not have.
          </Box>
        )}

        {/* Above the notes on purpose: it decides whether the notes are worth reading. */}
        {saveStates && saveStateNote && (
          <Box
            className={`update-dialog__warning${saveStates.kind === 'incompatible' ? ' update-dialog__warning--breaking' : ''}`}
            role="note"
          >
            <Text className="update-dialog__warning-title">{saveStateTitle(saveStates)}</Text>
            {saveStateNote}
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
          <Text as="p" className="update-dialog__status">
            This build cannot update itself. The release page has the download.
          </Text>
        )}

        {status === 'error' && (
          <Text as="p" className="update-dialog__error">Update failed: {state.error}</Text>
        )}

        {/* Last, because it is the way out when an update made things worse. */}
        <Box className="update-dialog__footnote">
          <Text as="p" className="update-dialog__footnote-text">
            Any earlier version can be picked above if something stops working. Please report it
            either way, so it gets fixed.
          </Text>
          <BugReportButton onClick={onReportBug} />
        </Box>
      </Box>
    </DialogShell>
  );
};

export { UpdateDialog };
