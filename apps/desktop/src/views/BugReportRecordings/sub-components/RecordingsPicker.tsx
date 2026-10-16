/* @layer renderer-app @kind component */
import { useCallback } from 'react';
import { Callout, Inline, ScrollArea, Stack, Tag, Toggle } from '@drizztdourden08/tessera/primitives';
import { ItemList } from '@drizztdourden08/tessera/composites';
import type { ItemListRowState } from '@drizztdourden08/tessera/composites';
import type { DebugCaptureSessionSummary } from '@app/debug-report';
import { RecordingPreview } from '@app/compounds/RecordingPreview';
import { recordingId } from '../behavior/recording-id';
import { recordingName } from '../behavior/recording-name';
import { useRecordings } from '../behavior/useRecordings';
import { NONE_MESSAGE, NONE_NEW_MESSAGE, SENT_LABEL, SHOW_SENT_LABEL, TITLE, UNDO_MS } from '../BugReportRecordings.constants';
import { IncludeButton } from './IncludeButton';
import type { RecordingsPickerProps } from './RecordingsPicker.type';

const RecordingsPicker = (props: RecordingsPickerProps) => {
  const { profileId, setExtras, disabled } = props;
  const { sessions, loading, selected, showSent, error, toggleSession, toggleShowSent, deleteSession } = useRecordings(profileId, setExtras);

  const render = useCallback((session: DebugCaptureSessionSummary) => ({
    icon: <RecordingPreview session={session} label={recordingName(session)} />,
    meta: session.sentAt === null ? undefined : <Tag>{SENT_LABEL}</Tag>,
  }), []);

  const rowActions = useCallback((session: DebugCaptureSessionSummary, row: ItemListRowState) => (
    <IncludeButton
      included={selected.has(session.sessionKey)}
      name={recordingName(session)}
      disabled={disabled}
      tabIndex={row.tabIndex}
      onToggle={() => toggleSession(session.sessionKey)}
    />
  ), [selected, disabled, toggleSession]);

  return (
    <Stack gap="sm" className="bug-report-recordings">
      <Inline justify="end" align="center">
        <Toggle checked={showSent} onChange={toggleShowSent} label={SHOW_SENT_LABEL} disabled={disabled} />
      </Inline>
      {error !== null && <Callout tone="danger">{error}</Callout>}
      <ScrollArea className="bug-report-recordings__list">
        <ItemList
          title={TITLE}
          items={sessions}
          getId={recordingId}
          getName={recordingName}
          render={render}
          rowActions={rowActions}
          actionVisibility="always"
          onActivate={toggleSession}
          onDelete={deleteSession}
          undoDelete={UNDO_MS}
          deleteKey
          filter={false}
          loading={loading}
          empty={showSent ? NONE_MESSAGE : NONE_NEW_MESSAGE}
        />
      </ScrollArea>
    </Stack>
  );
};

export { RecordingsPicker };
